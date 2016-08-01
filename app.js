
/**
 * 
 * @param {type} $
 * @returns {undefined}
 */
+function ($) {

    window.app = {
        /**
         @Name: app.init
         @Description: Initializes the application and initializes additional modules if they are included.
         */
        init: function () {

            $(window).on('hashchange', app.hashtag);
            app.hashtag();

            //standard buttons on forms click event 
            app.buttonBin.bind();
            app.controlBin.bind(app.custom.controlBinEventType);
            app.custom.init();
        },
        buttonBin: {
            bind: function () {
                if (app.buttonBin.buttons) {
                    app.buttonBin.buttons.unbind('click');
                }
                app.buttonBin.buttons = $('.button_bin button, .button_bin .button');
                app.buttonBin.buttons.click(app.buttonBin.click);
            },
            buttons: null,
            click: function (e) {

                
                var button = $(this);
                var bin = button.closest('.button_bin');
                var t_data = bin.data();
                var action = button.val();
                
                action = (action)?action:t_data['action'];
                                
                var ref = {
                    action: action,
                    bin: bin,
                    button: $(this),
                    data: $.extend(t_data, button.data()),
                    params: null,
                    event: e,
                    form: $(this.form),
                    message_parent: 'general_messages',
                    runAjax: false,
                    type: button.parent().attr('data-type'), //depreciated - data member takes care of this
                    id: button.parent().attr('data-id'), //depreciated - data member takes care of this
                    url: null
                };

                if(ref.data.skip_prevent){
                    e.preventDefault();                    
                }
                
                 console.log(ref);
                 
                if (app.custom.buttonSwitch) {
                    app.custom.buttonSwitch(ref);
                } else {
                    switch (ref.action) {
                        default:
                            alert(ref.action);
                            break;
                    }
                }

                console.log(ref);

                if (ref.runAjax) {
                    ref.url = (ref.url) ? ref.url : '/form/' + ref.type + '_' + ref.action;
                    app.ajax.run(ref.url, ref.params, ref.message_parent);
                }
            },
        },
        messages: {
            parent: null,
            add: function (bundle) {



                if (app.messages.parent !== null) {

                    //@TODO: Toying with the idea of having a default parent
                    //app.messages.parent = (app.messages.parent !== null)?'general_messages':app.messages.parent;
                    var remove = $('#' + app.messages.parent).attr('data-remove');
                    var display = $('#' + app.messages.parent).attr('data-display');



                    $.each(bundle, function (type, messages) {
                        type = (type == 'error') ? 'danger' : type;
                        if (['danger', 'success', 'warning'].indexOf(type) == -1)
                            return;

                        var list = $('#' + app.messages.parent + ' .alert-' + type + ' ul');



                        var items = [];
                        list.empty();

                        $.each(messages, function (i, message) {
                            items.push('<li>' + message + '</li>');
                        });

                        list.append(items.join(''));
                        list.parent().slideDown(remove);
                        list.parent().delay(display).slideUp(remove);

                    });
                } else {
                    alert('parent was null');
                }
            },
        },
        hashtag: function (report) {

            var hashes = window.location.hash.split('#');
            var funcName = 'app.custom';
            var params = {};
            var ret = {};

            if (window.location.hash.match(app.custom.hash.bypass)) {
                console.log(window.location.hash.match());
                return;
            }

            $.each(hashes, function (i, hash) {


                var base = hash.split('/');


                for (var i = 0; i < base.length; i++) {


                    if (base[i].indexOf('=') >= 1) {

                        var vars = base[i].split('&');

                        for (var x = 0; x < vars.length; x++) {
                            var pairs = vars[x].split('=');
                            if (pairs.length = 2) {
                                params[pairs[0]] = pairs[1];
                            }
                        }
                        
                        ret.params = params;
                        
                        break;

                    } else {

                        var cleanTag = $.trim(base[i]);
                        if (cleanTag != '') {
                            funcName += '.' + base[i];
                            ret.funcName = funcName;
                        }
                    }
                }
                
            });


            
            var func = eval(funcName);
            if (typeof func == 'function') {
                if(report != 1) {
                    func(params);
                }
            } else {
                
                ret.funcName = null;
                
                if ((window.location.hash.trim() != '') && app.custom.hash.default) {
                    window.location.hash = app.custom.hashDefault;
                }
            }
            
            return ret;
        },
        hospitality: function () {

            //Grab the curent date
            var today = new Date();
            var dd = today.getDate();
            var mm = today.getMonth() + 1; //January is 0!
            var yyyy = today.getFullYear();

            if (dd < 10) {
                dd = '0' + dd;
            }

            if (mm < 10) {
                mm = '0' + mm;
            }
            today = yyyy + mm + dd;

            //HTML5 Storage?
            if (typeof (Storage) !== "undefined") {
                //New Session?
                if (sessionStorage.hitcount) {
                    sessionStorage.hitcount = Number(sessionStorage.hitcount) + 1;
                } else {
                    sessionStorage.hitcount = 1;
                }

                //First Visit Today?
                if (localStorage.daycount) {
                    //Enable Class for Day Count
                    if (localStorage.daycount !== today) {
                        $('body').addClass('first-visit');
                        console.log('First Visit Today');
                        localStorage.daycount = today;
                    } else {
                        console.log('Previous Visits Today.');
                    }
                } else {
                    $('body').addClass('first-visit');
                    localStorage.daycount = today;
                    console.log("Set Day Count");
                }
            } else {
                console.log("Session Storage Not Supported.");
            }

            //Enable Class for Hit count
            if (sessionStorage.hitcount <= 1) {
                $('body').addClass('new-session');
            }

        },
        runCallbacks: function (bundle) {

            $.each(bundle, function (cbname, paramList) {
                var callback = eval(cbname);
                if (typeof callback == 'function') {
                    $.each(paramList, function (i, params) {
                        callback(params);
                    });
                } else {
                    console.log(cbname + ' is NOT a function');
                }
            });
        },
        refill: function (params) {


            if (("target" in params) && ("html" in params)) {
                $(params.target).html(params.html);
            } else
                console.log("app.refill: target and html not in passed params.");

            if ("afterFill" in params) {
                app.runCallbacks(params.afterFill);
            }

        },
        /**
         * @START_HERE:  gett this to work. It's being called from the server ok. 
         * it's just not running the stuff.
         * @param {type} params
         * @returns {undefined}
         */
        append: function (params) {
            if (("target" in params) && ("html" in params)) {
                $(params.target).append(params.html);
            } else
                console.log("app.refill: target and html not in passed params.");

        },
        ajax: {
            standardSuccess: function (ret) {

                if (ret.messages) {
                    app.messages.add(ret.messages);
                    app.messages.parent = null;
                }

                if (ret.callbacks)
                    app.runCallbacks(ret.callbacks);
            },
            run: function (url, data, messageParent, successCallback) {

                app.messages.parent = (typeof messageParent == 'string') ? messageParent : 'general_messages';
                successCallback = (typeof successCallback == 'function') ? successCallback : app.ajax.standardSuccess;

                $.ajax({
                    type: 'get',
                    url: url,
                    dataType: 'json',
                    data: data,
                    error: function (jqXHR, textStatus, errorMessage) {
                        alert("ERROR: \n\n" + errorMessage + ': ' + textStatus);
                    },
                    success: successCallback
                });


            }

        },
        modal: {
            show: function (params) {
                if (("html" in params)) {
                    app.modal.panel = $(params.html);
                    app.modal.panel.on('hidden.bs.modal', function (e) {
                        app.modal.panel.remove();
                        app.modal.panel = null;
                    });
                    app.modal.panel.modal({
                        static: true
                    });
                    app.buttonBin.bind();
                }
            },
            panel: null
        },
    };
}(jQuery);
