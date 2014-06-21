/**
 * @license
 * jQuery Tools @VERSION Tooltip - UI essentials
 *
 * NO COPYRIGHTS OR LICENSES. DO WHAT YOU LIKE.
 *
 * http://flowplayer.org/tools/tooltip/
 *
 * Since: November 2008
 * Date: @DATE
 */
(function ($) {
    // static constructs
    $.tools = $.tools || {version: '@VERSION'};

    $.tools.tooltip = {

        conf: {

            // default effect variables
            effect: 'toggle',
            fadeOutSpeed: "fast",
            predelay: 0,
            delay: 30,
            opacity: 1,
            tip: 0,
            fadeIE: false, // enables fade effect in IE

            // 'top', 'bottom', 'right', 'left', 'center'
            position: ['top', 'center'],
            offset: [0, 0],
            relative: false,
            cancelDefault: true,

            // type to event mapping
            events: {
                def: "mouseenter,mouseleave",
                input: "focus,blur",
                widget: "focus mouseenter,blur mouseleave",
                tooltip: "mouseenter,mouseleave"
            },

            // 1.2
            layout: '<div/>',
            tipClass: 'tooltip'
        },

        addEffect: function (name, loadFn, hideFn) {
            effects[name] = [loadFn, hideFn];
        }
    };


    var effects = {
        toggle: [
            function (done) {
                var conf = this.getConf(), tip = this.getTip(), o = conf.opacity;
                if (o < 1) {
                    tip.css({opacity: o});
                }
                tip.show();
                done.call();
            },

            function (done) {
                this.getTip().hide();
                done.call();
            }
        ],

        fade: [
            function (done) {
                var conf = this.getConf();
                if (!/msie/.test(navigator.userAgent.toLowerCase()) || conf.fadeIE) {
                    this.getTip().fadeTo(conf.fadeInSpeed, conf.opacity, done);
                }
                else {
                    this.getTip().show();
                    done();
                }
            },
            function (done) {
                var conf = this.getConf();
                if (!/msie/.test(navigator.userAgent.toLowerCase()) || conf.fadeIE) {
                    this.getTip().fadeOut(conf.fadeOutSpeed, done);
                }
                else {
                    this.getTip().hide();
                    done();
                }
            }
        ]
    };


    /* calculate tip position relative to the trigger */
    function getPosition(trigger, tip, conf) {


        // get origin top/left position
        var top = conf.relative ? trigger.position().top : trigger.offset().top,
            left = conf.relative ? trigger.position().left : trigger.offset().left,
            pos = conf.position[0];

        top -= tip.outerHeight(false) - conf.offset[0];
        left += trigger.outerWidth(false) + conf.offset[1];

        // iPad position fix
        if (/iPad/i.test(navigator.userAgent)) {
            top -= $(window).scrollTop();
        }

        // adjust Y
        var height = tip.outerHeight(false) + trigger.outerHeight(false);
        if (pos == 'center') {
            top += height / 2;
        }
        if (pos == 'bottom') {
            top += height;
        }


        // adjust X
        pos = conf.position[1];
        var width = tip.outerWidth(false) + trigger.outerWidth(false);
        if (pos == 'center') {
            left -= width / 2;
        }
        if (pos == 'left') {
            left -= width;
        }

        return {top: top, left: left};
    }


    function Tooltip(trigger, conf) {

        var self = this,
            fire = trigger.add(self),
            tip,
            timer = 0,
            pretimer = 0,
        //title = trigger.attr("title"),
            title = $('<div/>').text(trigger.attr('title')).html(), // to fix xss bug
            tipAttr = trigger.attr("data-tooltip"),
            effect = effects[conf.effect],
            shown,

        // get show/hide configuration
            isInput = trigger.is(":input"),
            isWidget = isInput && trigger.is(":checkbox, :radio, select, :button, :submit"),
            type = trigger.attr("type"),
            evt = conf.events[type] || conf.events[isInput ? (isWidget ? 'widget' : 'input') : 'def'];


        // check that configuration is sane
        if (!effect) {
            throw "Nonexistent effect \"" + conf.effect + "\"";
        }

        evt = evt.split(/,\s*/);
        if (evt.length != 2) {
            throw "Tooltip: bad events configuration for " + type;
        }


        // trigger --> show
        trigger.on(evt[0], function (e) {

            clearTimeout(timer);
            if (conf.predelay) {
                pretimer = setTimeout(function () {
                    self.show(e);
                }, conf.predelay);

            } else {
                self.show(e);
            }

            // trigger --> hide
        }).on(evt[1], function (e) {
            clearTimeout(pretimer);
            if (conf.delay) {
                timer = setTimeout(function () {
                    self.hide(e);
                }, conf.delay);

            } else {
                self.hide(e);
            }

        });


        // remove default title
        if (title && conf.cancelDefault) {
            trigger.removeAttr("title");
            trigger.data("title", title);
        }

        $.extend(self, {

            show: function (e) {

                // tip not initialized yet
                if (!tip) {

                    // data-tooltip
                    if (tipAttr) {
                        tip = $(tipAttr);

                        // single tip element for all
                    } else if (conf.tip) {
                        tip = $(conf.tip).eq(0);

                        // autogenerated tooltip
                    } else if (title) {
                        tip = $(conf.layout).addClass(conf.tipClass).appendTo(document.body)
                            .hide().append(title);

                        // manual tooltip
                    } else {
                        tip = trigger.find('.' + conf.tipClass);
                        if (!tip.length) {
                            tip = trigger.next();
                        }
                        if (!tip.length) {
                            tip = trigger.parent().next();
                        }
                    }

                    if (!tip.length) {
                        throw "Cannot find tooltip for " + trigger;
                    }
                }

                if (self.isShown()) {
                    return self;
                }

                // stop previous animation
                tip.stop(true, true);

                // get position
                var pos = getPosition(trigger, tip, conf);

                // restore title for single tooltip element
                if (conf.tip) {
                    tip.html(trigger.data("title"));
                }

                // onBeforeShow
                e = $.Event();
                e.type = "onBeforeShow";
                fire.trigger(e, [pos]);
                if (e.isDefaultPrevented()) {
                    return self;
                }


                // onBeforeShow may have altered the configuration
                pos = getPosition(trigger, tip, conf);

                // set position
                tip.css({position: 'absolute', top: pos.top, left: pos.left});

                shown = true;

                // invoke effect
                effect[0].call(self, function () {
                    e.type = "onShow";
                    shown = 'full';
                    fire.trigger(e);
                });


                // tooltip events
                var event = conf.events.tooltip.split(/,\s*/);

                if (!tip.data("__set")) {

                    tip.off(event[0]).on(event[0], function () {
                        clearTimeout(timer);
                        clearTimeout(pretimer);
                    });

                    if (event[1] && !trigger.is("input:not(:checkbox, :radio), textarea")) {
                        tip.off(event[1]).on(event[1], function (e) {

                            // being moved to the trigger element
                            if (e.relatedTarget != trigger[0]) {
                                trigger.trigger(evt[1].split(" ")[0]);
                            }
                        });
                    }

                    // bind agein for if same tip element
                    if (!conf.tip) tip.data("__set", true);
                }

                return self;
            },

            hide: function (e) {

                if (!tip || !self.isShown()) {
                    return self;
                }

                // onBeforeHide
                e = $.Event();
                e.type = "onBeforeHide";
                fire.trigger(e);
                if (e.isDefaultPrevented()) {
                    return;
                }

                shown = false;

                effects[conf.effect][1].call(self, function () {
                    e.type = "onHide";
                    fire.trigger(e);
                });

                return self;
            },

            isShown: function (fully) {
                return fully ? shown == 'full' : shown;
            },

            getConf: function () {
                return conf;
            },

            getTip: function () {
                return tip;
            },

            getTrigger: function () {
                return trigger;
            }

        });

        // callbacks
        $.each("onHide,onBeforeShow,onShow,onBeforeHide".split(","), function (i, name) {

            // configuration
            if ($.isFunction(conf[name])) {
                $(self).on(name, conf[name]);
            }

            // API
            self[name] = function (fn) {
                if (fn) {
                    $(self).on(name, fn);
                }
                return self;
            };
        });

    }


    // jQuery plugin implementation
    $.fn.tooltip = function (conf) {

        conf = $.extend(true, {}, $.tools.tooltip.conf, conf);

        // position can also be given as string
        if (typeof conf.position == 'string') {
            conf.position = conf.position.split(/,?\s/);
        }

        // install tooltip for each entry in jQuery object
        // that is not an existing instance
        this.each(function () {
            if ($(this).data("tooltip") === null) {
                api = new Tooltip($(this), conf);
                $(this).data("tooltip", api);
            }
            ;
        });

        return conf.api ? api : this;
    };

})(jQuery);

		

