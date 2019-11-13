const http = require('http');

var Service, Characteristic;

module.exports = function (homebridge) {
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;
    homebridge.registerAccessory("homebridge-http-contact-sensor", "LoxoneShades", LoxoneShades);
};

function LoxoneShades(log, config) {
    this.log = log;
    this.name = config.name;
    this.pollInterval = config.pollInterval;
    this.previousPosition = 100;
    this.position = 100;

    this.statusUrl = config.statusUrl || null;
    if (this.statusUrl == null) {
        this.log("statusUrl is required");
        process.exit(1);
    }

    this.targetPositionUrl = config.targetPositionUrl || null;
    if (this.targetPositionUrl == null) {
        this.log("targetPositionUrl is required");
        process.exit(1);
    }

    this.service = new Service.WindowCovering(this.name);
    setTimeout(this.monitorPosition.bind(this), this.pollInterval);
};

LoxoneShades.prototype = {

    monitorPosition: function () {
        this.getPosition((state) => {
            if (this.position != state) {
                this.position = state;
                this.service.getCharacteristic(Characteristic.CurrentPosition).setValue(this.position);
                this.service.getCharacteristic(Characteristic.PositionState).setValue(this.calcluationPositionState());
                this.previousPosition = this.position;
            }
            setTimeout(this.monitorPosition.bind(this), this.pollInterval);
        })
    },

    getPosition: function (callback) {
        http.get(this.statusUrl, (resp) => {
            let data = '';
            resp.on('data', (chunk) => {
                data += chunk;
            });
            resp.on('end', () => {
                callback(100 - (JSON.parse(data).LL.value * 100));
            });
        }).on("error", (err) => {
            console.error("Error: " + err.message);
            callback();
        });
    },

    calcluationPositionState: function() {
        if (this.previousPosition > this.position) {
            return 0
        } else if (this.previousPosition < this.position) {
            return 1
        } else {
            return 2;
        }
    },

    getName: function (callback) {
         callback(null, this.name);
    },

    getCurrentPosition: function (callback) {
        this.getPosition((state) => {
            this.position = state;
            this.log("getCurrentPosition: ", this.position);
            callback(null, this.position);
        })
    },

    setTargetPosition: function (state, callback) {
        http.get(this.targetPositionUrl + (100 - state), (resp) => {
            let data = '';
            resp.on('data', (chunk) => {
                data += chunk;
            });
            resp.on('end', () => {
                callback();
            });
        }).on("error", (err) => {
            console.error("Error: " + err.message);
            callback();
        });
    },

    getPositionState: function (callback) {
        this.getPosition((state) => {
            this.position = state;
            callback(null, this.calcluationPositionState());
        });
    },
  
    getServices: function () {
        var informationService = new Service.AccessoryInformation();

        informationService
            .setCharacteristic(Characteristic.Manufacturer, "Einwaller")
            .setCharacteristic(Characteristic.Model, "Shade state")
            .setCharacteristic(Characteristic.SerialNumber, "Version 0.1.0");

        this.service
            .getCharacteristic(Characteristic.Name)
            .on('get', this.getName.bind(this));

        this.service
            .getCharacteristic(Characteristic.CurrentPosition)
            .on('get', this.getCurrentPosition.bind(this));

        this.service
            .getCharacteristic(Characteristic.TargetPosition)
            .on('set', this.setTargetPosition.bind(this));

        this.service
            .getCharacteristic(Characteristic.PositionState)
            .on('get', this.getPositionState.bind(this));

        return [informationService, this.service];
    }
};
