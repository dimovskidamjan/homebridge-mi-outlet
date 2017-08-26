require('./Base');

const inherits = require('util').inherits;
const miio = require('miio');

var Accessory, PlatformAccessory, Service, Characteristic, UUIDGen;
var deviceThis, device;

PlugBase = function(platform, config) {
    this.init(platform, config);
    
    Accessory = platform.Accessory;
    PlatformAccessory = platform.PlatformAccessory;
    Service = platform.Service;
    Characteristic = platform.Characteristic;
    UUIDGen = platform.UUIDGen;
    
    deviceThis = this;
    device = new miio.Device({
        address: deviceThis.config['ip'],
        token: deviceThis.config['token']
    });
    
    this.accessories = {};
    if(!this.config['outletDisable'] && this.config['outletName'] && this.config['outletName'] != "") {
        this.accessories['outletAccessory'] = new PlugBaseOutlet();
    }
    if(!this.config['temperatureDisable'] && this.config['temperatureName'] && this.config['temperatureName'] != "") {
        this.accessories['temperatureAccessory'] = new PlugBaseTemperature();
    }
    if(!this.config['switchLEDDisable'] && this.config['switchLEDName'] && this.config['switchLEDName'] != "") {
        this.accessories['switchLEDAccessory'] = new PlugBaseSwitchLED();
    }
    
    return this.obj2array(this.accessories);
}
inherits(PlugBase, Base);

PlugBaseOutlet = function() {
    this.name = deviceThis.config['outletName'];
}

PlugBaseOutlet.prototype.getServices = function() {
    var services = [];

    var infoService = new Service.AccessoryInformation();
    infoService
        .setCharacteristic(Characteristic.Manufacturer, "XiaoMi")
        .setCharacteristic(Characteristic.Model, "Plug Base")
        .setCharacteristic(Characteristic.SerialNumber, "Undefined");
    services.push(infoService);
    
    var outletService = new Service.Outlet(this.name);
    outletService
        .getCharacteristic(Characteristic.On)
        .on('get', this.getPower.bind(this))
        .on('set', this.setPower.bind(this));
    services.push(outletService);

    return services;
}

PlugBaseOutlet.prototype.getPower = function(callback) {
    device.call("get_prop", ["power"]).then(result => {
        deviceThis.platform.log.debug("[MiOutletPlatform][DEBUG]PlugBase - Outlet - getPower: " + result);
        callback(null, result[0] === 'on' ? 1 : 0);
    }).catch(function(err) {
        deviceThis.platform.log.error("[MiOutletPlatform][ERROR]PlugBase - Outlet - getPower Error: " + err);
        callback(true);
    });
}

PlugBaseOutlet.prototype.setPower = function(value, callback) {
    if(value) {
        device.call("set_power", ['on']);
    } else {
        device.call("set_power", ['off']);
    }
    
    callback(null);    
}

PlugBaseTemperature = function() {
    this.name = deviceThis.config['temperatureName'];
}

PlugBaseTemperature.prototype.getServices = function() {
    var services = [];

    var infoService = new Service.AccessoryInformation();
    infoService
        .setCharacteristic(Characteristic.Manufacturer, "XiaoMi")
        .setCharacteristic(Characteristic.Model, "Plug Base")
        .setCharacteristic(Characteristic.SerialNumber, "Undefined");
    services.push(infoService);
    
    var temperatureService = new Service.TemperatureSensor(this.name);
    temperatureService
        .getCharacteristic(Characteristic.CurrentTemperature)
        .on('get', this.getTemperature.bind(this))
    services.push(temperatureService);

    return services;
}

PlugBaseTemperature.prototype.getTemperature = function(callback) {
    device.call("get_prop", ["temperature"]).then(result => {
        deviceThis.platform.log.debug("[MiOutletPlatform][DEBUG]PlugBase - Temperature - getTemperature: " + result);
        callback(null, result[0]);
    }).catch(function(err) {
        deviceThis.platform.log.error("[MiOutletPlatform][ERROR]PlugBase - Temperature - getTemperature Error: " + err);
        callback(true);
    });
}

PlugBaseSwitchLED = function() {
    this.name = deviceThis.config['switchLEDName'];
}

PlugBaseSwitchLED.prototype.getServices = function() {
    var services = [];

    var infoService = new Service.AccessoryInformation();
    infoService
        .setCharacteristic(Characteristic.Manufacturer, "XiaoMi")
        .setCharacteristic(Characteristic.Model, "Plug Base")
        .setCharacteristic(Characteristic.SerialNumber, "Undefined");
    services.push(infoService);
    
    var switchLEDService = new Service.Lightbulb(this.name);
    switchLEDService
        .getCharacteristic(Characteristic.On)
        .on('get', this.getLEDPower.bind(this))
        .on('set', this.setLEDPower.bind(this));
    services.push(switchLEDService);

    return services;
}

PlugBaseSwitchLED.prototype.getLEDPower = function(callback) {
    device.call("get_prop", ["wifi_led"]).then(result => {
        deviceThis.platform.log.debug("[MiOutletPlatform][DEBUG]PlugBase - SwitchLED - getLEDPower: " + result);
        callback(null, result[0] === 'on' ? 1 : 0);
    }).catch(function(err) {
        deviceThis.platform.log.error("[MiOutletPlatform][ERROR]PlugBase - SwitchLED - getLEDPower Error: " + err);
        callback(true);
    });
}

PlugBaseSwitchLED.prototype.setLEDPower = function(value, callback) {
    if(value) {
        device.call("set_wifi_led", ['on']);
    } else {
        device.call("set_wifi_led", ['off']);
    }
    
    callback(null);    
}