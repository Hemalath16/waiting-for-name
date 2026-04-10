import Types "types/traffic-emergency";
import Lib "lib/traffic-emergency";
import TrafficEmergencyMixin "mixins/traffic-emergency-api";
import Migration "migration";
import List "mo:core/List";
import Time "mo:core/Time";

(with migration = Migration.run)
actor {
  let signals = List.empty<Types.TrafficSignal>();
  let emergencyMessages = List.empty<Types.EmergencyMessage>();
  // Seed 6 demo signals at startup (runs once on canister init)
  do {
    var seedId : Nat = 0;
    let now = Time.now();
    let demos : [(Text, Types.SignalStatus)] = [
      ("Main St & 1st Ave", #green),
      ("Broadway & 5th St", #green),
      ("Oak Ave & Park Blvd", #green),
      ("Elm St & Central Dr", #green),
      ("Highway 101 & Exit 4", #green),
      ("Airport Rd & Terminal 1", #green),
    ];
    for ((location, status) in demos.values()) {
      ignore Lib.addSignal(signals, seedId, location, status, now);
      seedId += 1;
    };
  };

  include TrafficEmergencyMixin(signals, emergencyMessages);
};
