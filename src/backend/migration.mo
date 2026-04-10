import NewTypes "types/traffic-emergency";
import List "mo:core/List";

module {
  // Old EmergencyMessage type (before new fields were added)
  type OldUrgency = { #critical; #high; #normal };
  type OldEmergencyMessage = {
    id : Nat;
    message : Text;
    urgency : OldUrgency;
    location : Text;
    timestamp : Int;
    var resolved : Bool;
  };

  // Old SignalStatus and TrafficSignal (unchanged)
  type OldSignalStatus = { #red; #yellow; #green };
  type OldTrafficSignal = {
    id : Nat;
    location : Text;
    var status : OldSignalStatus;
    var lastUpdated : Int;
  };

  type OldActor = {
    emergencyMessages : List.List<OldEmergencyMessage>;
  };

  type NewActor = {
    emergencyMessages : List.List<NewTypes.EmergencyMessage>;
  };

  public func run(old : OldActor) : NewActor {
    let migratedMessages = old.emergencyMessages.map<OldEmergencyMessage, NewTypes.EmergencyMessage>(
      func(m) {
        {
          id = m.id;
          message = m.message;
          urgency = m.urgency;
          location = m.location;
          timestamp = m.timestamp;
          var resolved = m.resolved;
          var acknowledged = false;
          var acknowledgedAt = null;
          var response = null;
          var respondedAt = null;
          var dispatched = false;
          var dispatchedAt = null;
        };
      }
    );
    { emergencyMessages = migratedMessages };
  };
};
