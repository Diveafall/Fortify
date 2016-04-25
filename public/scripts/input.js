/*global FORTIFY */

// ------------------------------------------------------------------
//
// Input handling support
//
// ------------------------------------------------------------------
FORTIFY.input = (function() {
	'use strict';

	// Can handle two events: mouse click and movement
	function Mouse() {
		var clickEvents = [],
			moveEvents = [],
			moveHandler,
			clickHandler;

		function update(elapsedTime) {
			var clickEvent, moveEvent;
			
			if (clickHandler) {
				for (clickEvent = 0; clickEvent < clickEvents.length; ++clickEvent) {
					clickHandler(clickEvents[clickEvent]);
				}
			}
			
			if (moveHandler) {
				for (moveEvent = 0; moveEvent < moveEvents.length; ++moveEvent) {
					moveHandler(moveEvents[moveEvent]);
				}
			}
			
			clickEvents.length = 0;
			moveEvents.length = 0;
		}

		window.onclick = function(e) { clickEvents.push(e); };
		window.onmousemove = function(e) { moveEvents.push(e); };

		return {
			registerMoveHandler: function(handler) {
				moveHandler = handler;
			},
			registerClickHandler: function(handler) {
				clickHandler = handler;
			},
			update: update,
			reset: function() { clickEvents = []; }
		};
	}

	function Keyboard() {
		var controls = FORTIFY.Controls.getControls(), events = [], commandSwitch = undefined;
		
		function keyBindOccupied(keyBind) {
			var command;
			for (command in controls) {
				if (controls[command].keyBind.keyCode === keyBind.keyCode &&
					controls[command].keyBind.altKey === keyBind.altKey &&
					controls[command].keyBind.ctrlKey === keyBind.ctrlKey &&
					controls[command].keyBind.shiftKey === keyBind.shiftKey) {
					return true;
				}
			}
			return false;
		}
		
		function registerCommand(action, keyBind, handler) {
			if (controls[action]) {
				if (keyBind && keyBindOccupied(keyBind)) { alert('Keybind occupied.'); return; }
				if (keyBind) controls[action].keyBind = keyBind;
				if (handler) controls[action].handler = handler;
			} else {
				controls[action] = {
					keyBind: keyBind,
					handler: handler
				}
			}
			FORTIFY.Controls.saveControls(controls);
		}
			
		function update(elapsedTime) {
			var event, command;
			
			for (event = 0; event < events.length; ++event) {
				for (command in controls) {
					if (controls[command].keyBind.keyCode === events[event].keyCode &&
						controls[command].keyBind.altKey === events[event].altKey &&
						controls[command].keyBind.ctrlKey === events[event].ctrlKey &&
						controls[command].keyBind.shiftKey === events[event].shiftKey) {
						if (controls[command].handler) {
							controls[command].handler();
						}
					}
				}
			}
			
			events.length = 0;
		}
		
		window.onkeyup = function(e) {
			if (commandSwitch) {
				console.log('reregistering ', commandSwitch);
				registerCommand(commandSwitch.id, {
					keyCode: e.keyCode,
					altKey: e.altKey,
					shiftKey: e.shiftKey,
					ctrlKey: e.ctrlKey
				}, undefined);
				commandSwitch.parentElement.className = 'keybind';
				commandSwitch = undefined; // switch back to normal mode
				FORTIFY.pages['page-controls'].run(); // reload controls page
			} else {
				events.push(e);
			}
		};
		
		return {
			registerCommand: registerCommand,
			prepareForSwitch: function(commandLabel) {
				console.log(commandLabel.parentElement);
				commandLabel.parentElement.className += ' selected';
				commandSwitch = commandLabel;
			},
			endSwitch: function() {
				commandSwitch = undefined
			},
			update: update
		}
	}

	return {
		Keyboard : Keyboard(),
		Mouse : Mouse()
	};
}());
