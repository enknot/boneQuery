
/**
 * 
 * @param {type} $
 * @returns {undefined}
 */
+function($){
    
windodw.app = {
    

    /**
	@Name: app.init
	@Description: Initializes the application and initializes additional modules if they are included.
	*/
    init: function() {
        
        $(window).on('hashchange', app.hashtag);
        app.hashtag();

        //standard buttons on forms click event 
        app.buttonBin.bind();
        
        app.custom.init();
    },

    buttonBin: {

        bind: function() {            
            if (app.buttonBin.buttons) app.buttonBin.buttons.unbind('click');
            app.buttonBin.buttons = $('.button_bin button');             
            app.buttonBin.buttons.click(app.buttonBin.click);
        },

        buttons: null,

        click: function(e) {
            var button = $(this);
            
            var ref = {
                button : $(this), 
                type : button.parent().attr('data-type'), 
                typeID : button.parent().attr('data-id'),
                form : $(this.form), 
                action : button.val(), 
                runAjax : false, 
                data : null, 
                url : null,
                message_parent : 'general_messages'
            };          

            e.preventDefault();
            
            console.log(ref);

            switch (action) {
            case 'add_line':                      
                var count = $('#line_bin_' + ref.typeID +' .line_cluster').length;
                ref.data = "id=" + ref.typeID + '&index=' + count;
                ref.runAjax = true;
                break;
            case 'remove_line':  
                var count = $('#line_bin_' + ref.typeID +' .line_cluster').length;                
                if(count > 1){
                    ref.data = "id=" + ref.typeID + '&index=' + count;
                    ref.runAjax = true;
                    $('#line_bin_' + ref.typeID +' div.line_cluster:last-child').remove();
                }
                break; 
            case 'cancel_add_new':
                bio.select.replace(ref);
                break;
            }
            
            if (ref.runAjax) {                
                ref.url = url ? url : '/form/' + ref.type + '_' + ref.action;
                app.ajax.run(url, ref.data, ref.message_parent);
            }
        },
    },

    messages: {

        parent: null,

        add: function(bundle) {



            if (app.messages.parent !== null) {

                //@TODO: Toying with the idea of having a default parent
                //app.messages.parent = (app.messages.parent !== null)?'general_messages':app.messages.parent;
                var remove = $('#' + app.messages.parent).attr('data-remove');
                var display = $('#' + app.messages.parent).attr('data-display');



                $.each(bundle, function(type, messages) {
                    type = (type == 'error') ? 'danger' : type;
                    if (['danger', 'success', 'warning'].indexOf(type) == -1) return;

                    var list = $('#' + app.messages.parent + ' .alert-' + type + ' ul');



                    var items = [];
                    list.empty();

                    $.each(messages, function(i, message) {
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

    hashtag: function() {

        var hashes = window.location.hash.split('#');
        
       

        $.each(hashes, function(i, hash) {
            if (hash.length >= 2) {
                var split = hash.split('/');
                var funcName = split[0] + '.' + split[1];
                var func = eval(funcName);
                var params = {};
                for (i = 2; i < split.length; i++) {
                    var temp = split[i].split('=');
                    params[temp[0]] = temp[1];
                }
                
                console.log(funcName);
                console.log(params);
                
                if (typeof func == 'function') {
                    func(params);
                }
            }
        });
    },


    runCallbacks: function(bundle) {
        
        $.each(bundle, function(cbname, paramList) {
            var callback = eval(cbname);
            if (typeof callback == 'function') {
                $.each(paramList, function(i, params) {
                    callback(params);
                });
            } else {
                console.log(cbname + ' is NOT a function');
            }
        });
    },

    refill: function(params) {
        
       
        console.log(params);
        
        if (("target" in params) && ("html" in params)) {
            $(params.target).html(params.html);
        } else console.log("app.refill: target and html not in passed params.");
        
        if("afterFill" in params){
            app.runCallbacks(params.afterFill);            
        }

    },

    /**
     * @START_HERE:  gett this to work. It's being called from the server ok. 
     * it's just not running the stuff.
     * @param {type} params
     * @returns {undefined}
     */    
    append: function(params) {
        if (("target" in params) && ("html" in params)) {
            $(params.target).append(params.html);
        } else console.log("app.refill: target and html not in passed params.");

    },

    ajax: {

        standardSuccess: function(ret) {

            if (ret.messages) {
                app.messages.add(ret.messages);
                app.messages.parent = null;
            }

            if (ret.callbacks) app.runCallbacks(ret.callbacks);
        },

        run: function(url, data, messageParent, successCallback) {

            app.messages.parent = (typeof messageParent == 'string') ? messageParent : 'general_messages';
            successCallback = (typeof successCallback == 'function') ? successCallback : app.ajax.standardSuccess;

            $.ajax({
                type: 'get',
                url: url,
                dataType: 'json',
                data: data,
                error: function(jqXHR, textStatus, errorMessage) {
                    alert("ERROR: \n\n" + errorMessage + ': ' + textStatus);
                },
                success: successCallback
            });


        }

    }, 
    
    modal : {
        
        panel : null, 

        start : function(vars){
            
        }, 
        
        remove : function(){
            
        }
    }
};
}(jQuery);
