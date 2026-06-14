import 'dart:async';

import 'package:novel_creator/domain/events/domain_events.dart';

/// Lightweight cross-module event bus using Dart streams.
/// Modules publish events; subscribers listen by event type.
final class AppEventBus {
  AppEventBus();

  final StreamController<DomainEvent> _controller =
      StreamController<DomainEvent>.broadcast();

  /// Publish an event to all subscribers.
  void publish(DomainEvent event) {
    if (!_controller.isClosed) {
      _controller.add(event);
    }
  }

  /// Subscribe to all events.
  Stream<DomainEvent> get stream => _controller.stream;

  /// Subscribe to events of a specific type.
  Stream<T> on<T extends DomainEvent>() =>
      _controller.stream.where((event) => event is T).cast<T>();

  /// Subscribe to events for a specific project.
  Stream<DomainEvent> forProject(String projectId) =>
      _controller.stream.where((event) => event.projectId == projectId);

  /// Subscribe to events of a specific type for a specific project.
  Stream<T> onForProject<T extends DomainEvent>(String projectId) =>
      _controller.stream
          .where((event) => event is T && event.projectId == projectId)
          .cast<T>();

  /// Dispose the event bus. No more events can be published.
  Future<void> dispose() async {
    await _controller.close();
  }
}
