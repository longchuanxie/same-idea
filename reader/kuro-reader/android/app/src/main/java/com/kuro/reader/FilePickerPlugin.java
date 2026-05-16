package com.kuro.reader;

import android.app.Activity;
import android.content.ClipData;
import android.content.ContentResolver;
import android.content.Intent;
import android.database.Cursor;
import android.net.Uri;
import android.os.Build;
import android.provider.DocumentsContract;
import android.provider.OpenableColumns;

import androidx.activity.result.ActivityResult;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;

import org.json.JSONException;

import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;

@CapacitorPlugin(name = "FilePicker")
public class FilePickerPlugin extends Plugin {

    private static final int PICK_FILES_REQUEST = 10001;
    private static final int PICK_FOLDER_REQUEST = 10002;

    @PluginMethod
    public void pickFiles(PluginCall call) {
        boolean multiple = call.getBoolean("multiple", false);
        JSArray mimeTypes = call.getArray("mimeTypes", new JSArray());

        Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT);
        intent.addCategory(Intent.CATEGORY_OPENABLE);

        // Set mime types for archive and image files
        if (mimeTypes.length() > 0) {
            try {
                String[] types = new String[mimeTypes.length()];
                for (int i = 0; i < mimeTypes.length(); i++) {
                    types[i] = mimeTypes.getString(i);
                }
                intent.setType("*/*");
                intent.putExtra(Intent.EXTRA_MIME_TYPES, types);
            } catch (JSONException e) {
                intent.setType("*/*");
            }
        } else {
            intent.setType("*/*");
        }

        intent.putExtra(Intent.EXTRA_ALLOW_MULTIPLE, multiple);

        startActivityForResult(call, intent, "pickFilesResult");
    }

    @ActivityCallback
    private void pickFilesResult(PluginCall call, ActivityResult result) {
        if (call == null) return;

        if (result.getResultCode() == Activity.RESULT_OK) {
            Intent data = result.getData();
            if (data == null) {
                call.reject("No files selected");
                return;
            }

            List<JSObject> files = new ArrayList<>();
            ContentResolver resolver = getContext().getContentResolver();

            if (data.getClipData() != null) {
                ClipData clipData = data.getClipData();
                for (int i = 0; i < clipData.getItemCount(); i++) {
                    Uri uri = clipData.getItemAt(i).getUri();
                    JSObject fileInfo = getFileInfo(resolver, uri);
                    if (fileInfo != null) {
                        files.add(fileInfo);
                    }
                }
            } else if (data.getData() != null) {
                Uri uri = data.getData();
                JSObject fileInfo = getFileInfo(resolver, uri);
                if (fileInfo != null) {
                    files.add(fileInfo);
                }
            }

            JSObject ret = new JSObject();
            JSArray filesArray = new JSArray();
            for (JSObject file : files) {
                filesArray.put(file);
            }
            ret.put("files", filesArray);
            call.resolve(ret);
        } else {
            call.reject("File picking cancelled");
        }
    }

    @PluginMethod
    public void pickFolder(PluginCall call) {
        Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT_TREE);
        intent.addFlags(
            Intent.FLAG_GRANT_READ_URI_PERMISSION |
            Intent.FLAG_GRANT_PERSISTABLE_URI_PERMISSION
        );

        startActivityForResult(call, intent, "pickFolderResult");
    }

    @ActivityCallback
    private void pickFolderResult(PluginCall call, ActivityResult result) {
        if (call == null) return;

        if (result.getResultCode() == Activity.RESULT_OK) {
            Intent data = result.getData();
            if (data == null) {
                call.reject("No folder selected");
                return;
            }

            Uri treeUri = data.getData();
            if (treeUri == null) {
                call.reject("Invalid folder URI");
                return;
            }

            // Take persistable permission
            try {
                getContext().getContentResolver().takePersistableUriPermission(
                    treeUri,
                    Intent.FLAG_GRANT_READ_URI_PERMISSION
                );
            } catch (Exception e) {
                // Ignore permission error, continue anyway
            }

            String folderName = getFolderName(treeUri);
            List<JSObject> files = listFilesInFolder(treeUri);

            JSObject ret = new JSObject();
            ret.put("path", treeUri.toString());
            ret.put("name", folderName);

            JSArray filesArray = new JSArray();
            for (JSObject file : files) {
                filesArray.put(file);
            }
            ret.put("files", filesArray);
            call.resolve(ret);
        } else {
            call.reject("Folder picking cancelled");
        }
    }

    private JSObject getFileInfo(ContentResolver resolver, Uri uri) {
        try {
            String name = "";
            String mimeType = resolver.getType(uri);
            long size = 0;

            try (Cursor cursor = resolver.query(uri, null, null, null, null)) {
                if (cursor != null && cursor.moveToFirst()) {
                    int nameIndex = cursor.getColumnIndex(OpenableColumns.DISPLAY_NAME);
                    int sizeIndex = cursor.getColumnIndex(OpenableColumns.SIZE);
                    if (nameIndex >= 0) {
                        name = cursor.getString(nameIndex);
                    }
                    if (sizeIndex >= 0) {
                        size = cursor.getLong(sizeIndex);
                    }
                }
            }

            // Copy file to app cache for easy access
            String cachePath = copyToCache(resolver, uri, name);

            JSObject fileInfo = new JSObject();
            fileInfo.put("path", cachePath != null ? cachePath : uri.toString());
            fileInfo.put("name", name);
            fileInfo.put("mimeType", mimeType != null ? mimeType : "application/octet-stream");
            fileInfo.put("size", size);
            return fileInfo;
        } catch (Exception e) {
            return null;
        }
    }

    private String copyToCache(ContentResolver resolver, Uri uri, String fileName) {
        try {
            File cacheDir = new File(getContext().getCacheDir(), "picked_files");
            if (!cacheDir.exists()) {
                cacheDir.mkdirs();
            }

            File outFile = new File(cacheDir, fileName);
            try (InputStream is = resolver.openInputStream(uri);
                 FileOutputStream fos = new FileOutputStream(outFile)) {
                if (is == null) return null;
                byte[] buffer = new byte[8192];
                int read;
                while ((read = is.read(buffer)) != -1) {
                    fos.write(buffer, 0, read);
                }
            }
            return outFile.getAbsolutePath();
        } catch (Exception e) {
            return null;
        }
    }

    private String getFolderName(Uri treeUri) {
        String path = treeUri.getPath();
        if (path != null) {
            String[] parts = path.split(":");
            if (parts.length > 1) {
                String[] pathParts = parts[1].split("/");
                return pathParts[pathParts.length - 1];
            }
        }
        return "Selected Folder";
    }

    private List<JSObject> listFilesInFolder(Uri treeUri) {
        List<JSObject> files = new ArrayList<>();
        ContentResolver resolver = getContext().getContentResolver();

        String docId = DocumentsContract.getTreeDocumentId(treeUri);
        Uri childrenUri = DocumentsContract.buildChildDocumentsUriUsingTree(treeUri, docId);

        try (Cursor cursor = resolver.query(
                childrenUri,
                new String[]{
                    DocumentsContract.Document.COLUMN_DOCUMENT_ID,
                    DocumentsContract.Document.COLUMN_DISPLAY_NAME,
                    DocumentsContract.Document.COLUMN_MIME_TYPE,
                    DocumentsContract.Document.COLUMN_SIZE
                },
                null, null, null)) {

            if (cursor != null) {
                while (cursor.moveToNext()) {
                    String documentId = cursor.getString(0);
                    String name = cursor.getString(1);
                    String mimeType = cursor.getString(2);
                    long size = cursor.getLong(3);

                    // Skip directories
                    if (DocumentsContract.Document.MIME_TYPE_DIR.equals(mimeType)) {
                        continue;
                    }

                    Uri fileUri = DocumentsContract.buildDocumentUriUsingTree(treeUri, documentId);
                    String cachePath = copyToCache(resolver, fileUri, name);

                    JSObject fileInfo = new JSObject();
                    fileInfo.put("path", cachePath != null ? cachePath : fileUri.toString());
                    fileInfo.put("name", name);
                    fileInfo.put("mimeType", mimeType);
                    fileInfo.put("size", size);
                    files.add(fileInfo);
                }
            }
        } catch (Exception e) {
            // Ignore errors
        }

        return files;
    }
}
