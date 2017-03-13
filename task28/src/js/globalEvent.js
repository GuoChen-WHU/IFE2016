module.exports = {
  handlers: {},

  subscribe: function (event, callback, context) {
    var handlers = this.handlers[event] || (this.handlers[event] = []);
    handlers.push({callback: callback, context: context});
  },

  trigger: function (event) {
    var handlers = this.handlers[event],
        args = Array.prototype.slice.call(arguments, 1);
    handlers.map(function (handler) {
      var callback = handler.callback,
          context = handler.context;

      callback.apply(context, args);
    });
  }
};