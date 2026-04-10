import Types "../types/traffic-emergency";
import List "mo:core/List";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";

module {
  public func toSignalView(self : Types.TrafficSignal) : Types.TrafficSignalView {
    { id = self.id; location = self.location; status = self.status; lastUpdated = self.lastUpdated };
  };

  public func toEmergencyView(self : Types.EmergencyMessage) : Types.EmergencyMessageView {
    {
      id = self.id;
      message = self.message;
      urgency = self.urgency;
      location = self.location;
      timestamp = self.timestamp;
      resolved = self.resolved;
      acknowledged = self.acknowledged;
      acknowledgedAt = self.acknowledgedAt;
      response = self.response;
      respondedAt = self.respondedAt;
      dispatched = self.dispatched;
      dispatchedAt = self.dispatchedAt;
    };
  };

  public func listSignals(signals : List.List<Types.TrafficSignal>) : [Types.TrafficSignalView] {
    signals.map<Types.TrafficSignal, Types.TrafficSignalView>(toSignalView).toArray();
  };

  public func getSignal(signals : List.List<Types.TrafficSignal>, id : Nat) : ?Types.TrafficSignalView {
    switch (signals.find(func(s : Types.TrafficSignal) : Bool { s.id == id })) {
      case (?s) ?toSignalView(s);
      case null null;
    };
  };

  public func updateSignalStatus(signals : List.List<Types.TrafficSignal>, id : Nat, status : Types.SignalStatus, now : Int) : Bool {
    var found = false;
    signals.mapInPlace(
      func(s : Types.TrafficSignal) : Types.TrafficSignal {
        if (s.id == id) {
          found := true;
          s.status := status;
          s.lastUpdated := now;
          s;
        } else {
          s;
        };
      }
    );
    found;
  };

  public func addSignal(signals : List.List<Types.TrafficSignal>, nextId : Nat, location : Text, status : Types.SignalStatus, now : Int) : Types.TrafficSignal {
    let signal : Types.TrafficSignal = {
      id = nextId;
      location = location;
      var status = status;
      var lastUpdated = now;
    };
    signals.add(signal);
    signal;
  };

  public func listEmergencyMessages(messages : List.List<Types.EmergencyMessage>) : [Types.EmergencyMessageView] {
    // Return newest first by reversing
    let views = messages.map<Types.EmergencyMessage, Types.EmergencyMessageView>(toEmergencyView);
    views.toArray().reverse();
  };

  public func submitEmergencyMessage(messages : List.List<Types.EmergencyMessage>, nextId : Nat, message : Text, urgency : Types.Urgency, location : Text, now : Int) : Types.EmergencyMessage {
    let msg : Types.EmergencyMessage = {
      id = nextId;
      message = message;
      urgency = urgency;
      location = location;
      timestamp = now;
      var resolved = false;
      var acknowledged = false;
      var acknowledgedAt = null;
      var response = null;
      var respondedAt = null;
      var dispatched = false;
      var dispatchedAt = null;
    };
    messages.add(msg);
    msg;
  };

  public func resolveEmergencyMessage(messages : List.List<Types.EmergencyMessage>, id : Nat) : Bool {
    var found = false;
    messages.mapInPlace(
      func(m : Types.EmergencyMessage) : Types.EmergencyMessage {
        if (m.id == id) {
          found := true;
          m.resolved := true;
          m;
        } else {
          m;
        };
      }
    );
    found;
  };

  public func acknowledgeEmergencyMessage(messages : List.List<Types.EmergencyMessage>, id : Nat, now : Int) : Bool {
    var found = false;
    messages.mapInPlace(
      func(m : Types.EmergencyMessage) : Types.EmergencyMessage {
        if (m.id == id) {
          found := true;
          m.acknowledged := true;
          m.acknowledgedAt := ?now;
          m;
        } else {
          m;
        };
      }
    );
    found;
  };

  public func respondToEmergencyMessage(messages : List.List<Types.EmergencyMessage>, id : Nat, response : Text, now : Int) : Bool {
    var found = false;
    messages.mapInPlace(
      func(m : Types.EmergencyMessage) : Types.EmergencyMessage {
        if (m.id == id) {
          found := true;
          m.response := ?response;
          m.respondedAt := ?now;
          m;
        } else {
          m;
        };
      }
    );
    found;
  };

  public func dispatchEmergencyMessage(messages : List.List<Types.EmergencyMessage>, id : Nat, now : Int) : Bool {
    var found = false;
    messages.mapInPlace(
      func(m : Types.EmergencyMessage) : Types.EmergencyMessage {
        if (m.id == id) {
          found := true;
          m.dispatched := true;
          m.dispatchedAt := ?now;
          m;
        } else {
          m;
        };
      }
    );
    found;
  };

  public func unresolvedCount(messages : List.List<Types.EmergencyMessage>) : Nat {
    messages.foldLeft<Nat, Types.EmergencyMessage>(0, func(acc : Nat, m : Types.EmergencyMessage) : Nat {
      if (not m.resolved) acc + 1 else acc;
    });
  };
};
