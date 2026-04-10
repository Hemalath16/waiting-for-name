import Types "../types/traffic-emergency";
import Lib "../lib/traffic-emergency";
import List "mo:core/List";
import Time "mo:core/Time";
mixin (
  signals : List.List<Types.TrafficSignal>,
  emergencyMessages : List.List<Types.EmergencyMessage>
) {
  var nextSignalId : Nat = 0;
  var nextMessageId : Nat = 0;

  // Traffic Signals

  public query func listSignals() : async [Types.TrafficSignalView] {
    Lib.listSignals(signals);
  };

  public query func getSignal(id : Nat) : async ?Types.TrafficSignalView {
    Lib.getSignal(signals, id);
  };

  public func updateSignalStatus(id : Nat, status : Types.SignalStatus) : async Bool {
    Lib.updateSignalStatus(signals, id, status, Time.now());
  };

  // Emergency Messages

  public query func listEmergencyMessages() : async [Types.EmergencyMessageView] {
    Lib.listEmergencyMessages(emergencyMessages);
  };

  public func submitEmergencyMessage(message : Text, urgency : Types.Urgency, location : Text) : async Nat {
    let msg = Lib.submitEmergencyMessage(emergencyMessages, nextMessageId, message, urgency, location, Time.now());
    nextMessageId += 1;
    msg.id;
  };

  public func resolveEmergencyMessage(id : Nat) : async Bool {
    Lib.resolveEmergencyMessage(emergencyMessages, id);
  };

  public query func unresolvedEmergencyCount() : async Nat {
    Lib.unresolvedCount(emergencyMessages);
  };

  public func acknowledgeEmergencyMessage(id : Nat) : async Bool {
    Lib.acknowledgeEmergencyMessage(emergencyMessages, id, Time.now());
  };

  public func respondToEmergencyMessage(id : Nat, response : Text) : async Bool {
    Lib.respondToEmergencyMessage(emergencyMessages, id, response, Time.now());
  };

  public func dispatchEmergencyMessage(id : Nat) : async Bool {
    Lib.dispatchEmergencyMessage(emergencyMessages, id, Time.now());
  };
};
