module {
  public type SignalStatus = { #red; #yellow; #green };

  public type TrafficSignal = {
    id : Nat;
    location : Text;
    var status : SignalStatus;
    var lastUpdated : Int;
  };

  public type TrafficSignalView = {
    id : Nat;
    location : Text;
    status : SignalStatus;
    lastUpdated : Int;
  };

  public type Urgency = { #critical; #high; #normal };

  public type EmergencyMessage = {
    id : Nat;
    message : Text;
    urgency : Urgency;
    location : Text;
    timestamp : Int;
    var resolved : Bool;
    var acknowledged : Bool;
    var acknowledgedAt : ?Int;
    var response : ?Text;
    var respondedAt : ?Int;
    var dispatched : Bool;
    var dispatchedAt : ?Int;
  };

  public type EmergencyMessageView = {
    id : Nat;
    message : Text;
    urgency : Urgency;
    location : Text;
    timestamp : Int;
    resolved : Bool;
    acknowledged : Bool;
    acknowledgedAt : ?Int;
    response : ?Text;
    respondedAt : ?Int;
    dispatched : Bool;
    dispatchedAt : ?Int;
  };
};
