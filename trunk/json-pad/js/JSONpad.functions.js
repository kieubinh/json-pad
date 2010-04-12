var UpdateApplication = {
	appUpdater: new runtime.air.update.ApplicationUpdaterUI(),

	configXml: "app:/update-config.xml",

	init: function () {
		//this.appUpdater = new air.ApplicationUpdaterUI();
		//debug.trace("--"+air.update.events.UpdateEvent.INITIALIZED);
		this.appUpdater.configurationFile = new air.File( this.configXml );
		this.appUpdater.addEventListener(air.ErrorEvent.ERROR, UpdateApplication.onError);
		this.appUpdater.addEventListener("initialized", UpdateApplication.onInitialization);
		this.appUpdater.initialize();
	},

	getApplicationInfo: function () {
		var xmlString = air.NativeApplication.nativeApplication.applicationDescriptor;
		var appXml = new DOMParser();
		var xmlObject = appXml.parseFromString(xmlString, "text/xml");
		var root = xmlObject.getElementsByTagName('application')[0];

		return [root.getElementsByTagName("version")[0].firstChild.data, root.getElementsByTagName("name")[0].firstChild.data];
	},

	getApplicationVersion: function () {
		return this.getApplicationInfo()[0];
	},

	getApplicationName: function () {
		return this.getApplicationInfo()[1];
	},

	checkUpdate: function () {
		debug.trace("blub?");
		UpdateApplication.appUpdater.checkNow();
	},

	onInitialization: function () {
		UpdateApplication.checkUpdate();
	},

	onError: function ( event ) {
		alert(event.toString());
	}
}

var airApplicationExit = function () {
	var exitingEvent = new air.Event(air.Event.EXITING, false, true);
	air.NativeApplication.nativeApplication.dispatchEvent(exitingEvent);
	if (!exitingEvent.isDefaultPrevented()) {
		air.NativeApplication.nativeApplication.exit();
	}
};