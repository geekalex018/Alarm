const readline = require("readline");
const { setTimeout } = require("timers/promises");

class Alarm {
  constructor(time, day) {
    this.time = time;
    this.day = day;
    this.snoozeCount = 0;
    this.isActive = true;
  }

  //handle snoozing with a maximum of 3 times at 5-min intervals
  snooze() {
    if (this.snoozeCount < 3) {
      this.snoozeCount++;
      const [hours, minutes] = this.time.split(":").map(Number);
      const newMinutes = minutes + 5 * this.snoozeCount;
      this.time = `${hours}:${newMinutes < 60 ? newMinutes : newMinutes - 60}`;
      if (newMinutes >= 60) {
        this.time = `${hours + 1}:${newMinutes - 60}`;
      }
      return true;
    }
    return false;
  }

  deactivate() {
    this.isActive = false;
  }
}

class AlarmClock {
  constructor() {
    this.alarms = [];
  }

  //managing a list of alarms eg: adding or deleting an alarms
  addAlarm(time, day) {
    const alarm = new Alarm(time, day);
    this.alarms.push(alarm);
    console.log(`Alarm set for ${time} on ${day}`);
  }

  deleteAlarm(index) {
    if (index >= 0 && index < this.alarms.length) {
      this.alarms.splice(index, 1);
      console.log(`Alarm ${index} deleted`);
    } else {
      console.log(`Alarm ${index} does not exist`);
    }
  }

  async checkAlarms() {
    while (true) {
      const now = new Date();
      const currentTime = now.toTimeString().slice(0, 5);
      const currentDay = now.toLocaleString("en-us", { weekday: "long" });

      this.alarms.forEach((alarm, index) => {
        if (
          alarm.isActive &&
          alarm.day === currentDay &&
          alarm.time === currentTime
        ) {
          console.log(`Alarm ${index} ringing!`);
          alarm.snooze();
          alarm.deactivate();
        }
      });

      await setTimeout(60000); // Check alarms every minute
    }
  }

  displayCurrentTime() {
    const now = new Date();
    console.log(now.toTimeString().slice(0, 8));
  }
}

// create a class to handle user input
class Utils {
  static async prompt(question) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    return new Promise((resolve) =>
      rl.question(question, (answer) => {
        rl.close();
        resolve(answer);
      })
    );
  }
}

(async function main() {
  const alarmClock = new AlarmClock();

  // checking alarms in the background
  alarmClock.checkAlarms();

  while (true) {
    console.log(
      "\n1. Display Current Time\n2. Add Alarm\n3. Delete Alarm\n4. Exit"
    );
    const choice = await Utils.prompt("Choose an option: ");

    switch (choice) {
      case "1":
        alarmClock.displayCurrentTime();
        break;
      case "2":
        const time = await Utils.prompt("Enter alarm time (HH:MM): ");
        const day = await Utils.prompt("Enter day of the week: ");
        alarmClock.addAlarm(time, day);
        break;
      case "3":
        const index = parseInt(
          await Utils.prompt("Enter alarm index to delete: "),
          10
        );
        alarmClock.deleteAlarm(index);
        break;
      case "4":
        process.exit(0);
        break;
      default:
        console.log("Invalid choice, please try again.");
    }
  }
})();
