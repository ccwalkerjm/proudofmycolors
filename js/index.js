var g_proudOfMyColorsService; // = new proudOfMyColorsService()


var _$message;

//manage query strings
function getQueryStringParams(sParam) {
    var sPageURL = window.location.search.substring(1);
    var sURLVariables = sPageURL.split('&');
    for (var i = 0; i < sURLVariables.length; i++) {
        var sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] == sParam) {
            return sParameterName[1];
        }
    }
}


//loader
function setLoadingState(loadingState) {
    if (loadingState)
        $("body").addClass("loading");
    else
        $("body").removeClass("loading");
}

//convert to json without error
function ConvertToJson(r) {
    try {
        while (true) {
            r = JSON.parse(r);
        }
    } catch (e) {
        // not json
    }
    return r;
}

//convert form to json///
$.fn.serializeObject = function() {
    var o = {};
    var a = this.serializeArray();
    $.each(a, function() {
        if (o[this.name] !== undefined) {
            if (!o[this.name].push) {
                o[this.name] = [o[this.name]];
            }
            o[this.name].push(this.value || '');
        } else {
            o[this.name] = this.value || '';
        }
    });
    return o;
};


String.prototype.capitalizeFirstLetter = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
};

function formatDataPart(dp) {
    dp = dp.toString();
    if (dp.length == 1) {
        return '0' + dp;
    } else {
        return dp;
    }
}

//display message
function display(message, err) {
    _$message.removeAttr('class');
    if (err) {
        _$message.addClass('alert alert-warning');
        message = '<strong>Error:</strong>' + message;
    } else {
        _$message.addClass('alert alert-info');
        message = '<strong>Message:</strong>' + message;
    }
    _$message.html(message).fadeIn().delay(10000).fadeOut();
}

function isAdminPage(pagePath) {
    if (pagePath == '/admin/manage_users.html' ||
        pagePath == '/admin/manage_products.html') {
        return true;
    }
    return false;
}


function initPage(callback) {
    //set message
    _$message = $(document).find('.message');

    //spinning loader
    $(document).on({
        ajaxStart: function() {
            $("body").addClass("loading");
        },
        ajaxStop: function() {
            $("body").removeClass("loading");
        }
    });
    setLoadingState(true);

    g_proudOfMyColorsService = new proudOfMyColorsService(function(err, $this) {
        setLoadingState(false);
        if (err) {
            g_proudOfMyColorsService.signoff();
            location.assign('/index.html');
            return;
        }
        //not signed in
        var admin_sub = $('<div/>').addClass('pull-right');
        var valid_page = false;
        if ($this.getUsername()) {
            valid_page = true;
            admin_sub.html('<a href="/admin/changePassword.html">' + $this.getUsername() + '</a>|<a href="#"id="logout">Logout</a>|<a href="/admin/manage_users.html">Users</a>|<a href="/admin/manage_products.html">Products</a>');
        } else if(!isAdminPage(location.pathname)) {
            valid_page = true;
            admin_sub.html('<a href="/admin/account.html">Account</a>');
        }
        admin_sub.appendTo('#admin');
        if (valid_page === true) {
            if (callback && typeof callback == "function") {
                callback(null, $this);
            }
        } else {
            location.assign('/index.html');
        }
    });


    $('#admin').on('click', '#logout', function() {
        g_proudOfMyColorsService.signoff();
        location.assign('/index.html');
    });

}
