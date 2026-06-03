enum RevisionStatus {
  pending,
  accepted,
  rejected,
  superseded;

  bool canTransitionTo(RevisionStatus target) => switch (this) {
    RevisionStatus.pending =>
      target == RevisionStatus.accepted ||
          target == RevisionStatus.rejected ||
          target == RevisionStatus.superseded,
    RevisionStatus.accepted => false,
    RevisionStatus.rejected => false,
    RevisionStatus.superseded => false,
  };

  bool get isTerminal =>
      this == RevisionStatus.accepted ||
      this == RevisionStatus.rejected ||
      this == RevisionStatus.superseded;
}
