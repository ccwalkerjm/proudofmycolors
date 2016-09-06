var g_proudOfMyColorsService; // = new proudOfMyColorsService()
var g_shoppingCartBtn = "shoppingCartBtn";
var g_shoppingCartBtnClass = "shoppingCartBtnClass";
var g_shopping_cart_key_name = "_courserv_shopping_cart_key_0001";
var g_valid_countries = [];
g_valid_countries.push({"code":"","name":""});
g_valid_countries.push({"code":"US","name":"United States"});
g_valid_countries.push({"code":"CA","name":"Canada"});
g_valid_countries.push({"code":"JM","name":"Jamaica"});
g_valid_countries.push({"code":"MX","name":"Mexico"});


var _$message;

function getProductTemplate() {
    var product = {};
    product.description = "";
    product.productName = "";
    product.id = 0;
    product.image = "";
    product.quantity = 0;
    product.size = "";
    return product;
}

function getShoppingCart() {
    var x_shopping_cart_list = sessionStorage.getItem(g_shopping_cart_key_name);
    if (x_shopping_cart_list) {
        x_shopping_cart_list = JSON.parse(x_shopping_cart_list);
    } else {
        x_shopping_cart_list = [];
    }
    return x_shopping_cart_list;
}

function setShoppingCart(x_shopping_cart_list) {
    if (x_shopping_cart_list.length > 0)
        sessionStorage.setItem(g_shopping_cart_key_name, JSON.stringify(x_shopping_cart_list));
    else
        sessionStorage.removeItem(g_shopping_cart_key_name);
}

function addToCart(product) {
    var productExits = false;
    var x_shopping_cart_list = getShoppingCart();
    for (var i = 0; i < x_shopping_cart_list.length; i++) {
        if (product.id == x_shopping_cart_list[i].id && product.size == x_shopping_cart_list[i].size) {
            x_shopping_cart_list[i].quantity = product.quantity;
            productExits = true;
            break;
        }
    }
    if (!productExits) {
        x_shopping_cart_list.push(product);
        setShoppingCart(x_shopping_cart_list);
    }
    updateShoppingcartDisplay();
}

function removeFromCart(product) {
    var x_shopping_cart_list = getShoppingCart();
    for (var i = 0; i < x_shopping_cart_list.length; i++) {
        if (product.id == x_shopping_cart_list[i].id && product.size == x_shopping_cart_list[i].size) {
            x_shopping_cart_list.splice(i, 1);
            break;
        }
    }
    setShoppingCart(x_shopping_cart_list);
    updateShoppingcartDisplay();
}

function updateShoppingcartDisplay() {
    var x_shopping_cart_list = getShoppingCart();
    //update button
    var adminSection = $('#admin');
    if (adminSection.length > 0) {
        var shoppingCartBtn = adminSection.find('#' + g_shoppingCartBtn).removeClass().empty();
        if (x_shopping_cart_list.length === 0) {
            shoppingCartBtn.addClass("btn btn-default btn-sm  text-center");
            shoppingCartBtn.html('<span class="glyphicon glyphicon-shopping-cart"></span>Empty');
        } else {
            shoppingCartBtn.addClass("btn btn-primary btn-sm  text-center");
            shoppingCartBtn.html('<span class="glyphicon glyphicon-shopping-cart"></span>Checkout');
        }
        shoppingCartBtn.addClass(g_shoppingCartBtnClass);
    }
    //populate widget
    var shoppingCartWidget = $('#shoppingCartWidget');
    if (shoppingCartWidget.length > 0) {
        shoppingCartWidget.removeClass().addClass('widget').empty();
        var widgetTitle = $("<div/>").addClass('widget-title');
        widgetTitle.append("<h3>Shopping Cart</h3>").appendTo(shoppingCartWidget);
        var productListHolder = $("<ul/>").addClass("cart list-unstyled");
        for (var i = 0; i < x_shopping_cart_list.length; i++) {
            var item_li = $("<li/>");
            var item_row = $("<div/>").addClass("row");
            //description
            var item_description = $("<div/>").addClass("col-sm-7 col-xs-7").append(x_shopping_cart_list[i].quantity);
            item_description.append("&nbsp;");
            var item_description_a = $("<a/>").attr("href", "#").html(x_shopping_cart_list[i].productName);
            var item_size = $("<span/>").html("-" + x_shopping_cart_list[i].size).appendTo(item_description_a);
            item_description_a.appendTo(item_description);
            //pricing
            var item_pricing = $("<div/>").addClass("col-sm-5 col-xs-5 text-right");
            var item_total = x_shopping_cart_list[i].quantity * x_shopping_cart_list[i].price;
            var item_pricing_bold = $("<strong/>").html(accounting.formatMoney(item_total)).appendTo(item_pricing);
            var delete_link = $("<a/>").attr("href", "#");
            var delete_icon = $("<i/>").addClass("fa fa-trash-o").appendTo(delete_link);
            delete_link.appendTo(item_pricing);
            item_row.append(item_description);
            item_row.append(item_pricing);
            item_li.append(item_row).appendTo(productListHolder);
        }
        shoppingCartWidget.append(productListHolder);
    }
    //Checkout
    var shoppingCartCheckout = $('#shoppingCartCheckout');
    if (shoppingCartCheckout.length > 0) {
        shoppingCartCheckout.removeClass().addClass('widget').empty();
        var shoppingCartCheckoutTitle = $("<div/>").addClass('widget-title');
        shoppingCartCheckoutTitle.append("<h3>Confirm Cart</h3>").appendTo(shoppingCartCheckout);

        var shoppingCartCheckoutBtn = $("<button/>");
        if (x_shopping_cart_list.length === 0)
            shoppingCartCheckoutBtn.addClass("btn btn-default");
        else
            shoppingCartCheckoutBtn.addClass("btn btn-primary");
        shoppingCartCheckoutBtn.addClass(g_shoppingCartBtnClass);
        shoppingCartCheckoutBtn.html('<span class="glyphicon glyphicon-shopping-cart"></span>Checkout');
        shoppingCartCheckoutBtn.appendTo(shoppingCartCheckout);
    }

    //populate shopping cart
    var shoppingCartTable = $('#shoppingCartTable tbody').empty();
    if(shoppingCartTable.length > 0){
      var total = 0;
      for (var k = 0; k < x_shopping_cart_list.length; k++) {
        var $tr = $('<tr/>');
        //img cell
        var imgCell = $('<td/>');
        var img = $('<img/>').addClass('img-cart').attr('src',x_shopping_cart_list[k].smallImageName);
        img.appendTo(imgCell);
        imgCell.appendTo($tr);

        //type cell
        var typeCell = $('<td/>');
        var productName = $('<strong/>').text(x_shopping_cart_list[k].productName);
        productName.appendTo(typeCell);
        var size_p = $('<p/>').html('Size : '+x_shopping_cart_list[k].size);
        size_p.appendTo(typeCell);
        typeCell.appendTo($tr);

        //quantity cell
        var quantityCell = $('<td/>');
        var quantitySection = $('<div/>').addClass('form-inline');
        var quantityInput = $('<input/>').addClass('form-control').attr('type','number');
        quantityInput.val(x_shopping_cart_list[k].quantity).appendTo(quantitySection);
        var _productId = $('<input/>').addClass('productId').attr('type','hidden');
        _productId.val(x_shopping_cart_list[k].id).appendTo(quantitySection);
        var updateBtn = $('<button/>').addClass('btn btn-default update').attr('rel','tooltip');
        updateBtn.attr('title','Update');
        var update_i = $('<i/>').addClass('fa fa-pencil').appendTo(updateBtn);
        updateBtn.appendTo(quantitySection);
        var deleteBtn =  $('<a/>').addClass('btn btn-primary delete').attr('rel','tooltip');
        deleteBtn.attr("href","#").attr('title','Delete');
        var delete_i = $('<i/>').addClass('fa fa-trash-o').appendTo(deleteBtn);
        deleteBtn.appendTo(quantitySection);
        quantitySection.appendTo(quantityCell);
        quantityCell.appendTo($tr);
        //price cell
        var priceFormat = accounting.formatMoney(x_shopping_cart_list[k].price);
        var priceCell = $('<td/>').html(priceFormat).appendTo($tr);
        var item_total = x_shopping_cart_list[k].quantity * x_shopping_cart_list[k].price;
        var itemTotalCell = $('<td/>').html(accounting.formatMoney(item_total)).appendTo($tr);
        //create row
        shoppingCartTable.append($tr);
        total += item_total;
      }
      shoppingCartTable.append('<tr><td colspan="6">&nbsp;</td></tr>');
      //summary
      var $total_tr = $('<tr/>');
      //img cell
      var total_description_cell = $('<td/>').attr('colspan','4').addClass('text-right');
      total_description_cell.html('Total Product').appendTo($total_tr);
      var total_amount_cell = $('<td/>').html(accounting.formatMoney(total)).appendTo($total_tr);
      shoppingCartTable.append($total_tr);
    }



}


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

//randomized items
function getRandomizedItems(displaySize, size, exceptItems) {
    var randomizedItems = [];
    var k = 1000;
    while (--k > 0) {
        var item = getRandomIntInclusive(0, size - 1);
        var itemValid = true;
        if (exceptItems) {
            for (var j = 0; j < exceptItems.length; j++) {
                if (item == exceptItems[j]) {
                    itemValid = false;
                    break;
                }
            }
        }
        for (var i = 0; i < randomizedItems.length; i++) {
            if (item == randomizedItems[i]) {
                itemValid = false;
                break;
            }
        }
        if (itemValid) {
            randomizedItems.push(item);
            if (randomizedItems.length == displaySize) {
                break;
            }
        }
    }
    return randomizedItems;
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


function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
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
        } else if (!isAdminPage(location.pathname)) {
            valid_page = true;
            admin_sub.html('<a href="/admin/account.html">Account</a>');
        }
        var shoppingCartBtn = $('<button/>').attr("id", g_shoppingCartBtn);
        var $div = $("<div/>").append("<br/>").append(shoppingCartBtn).appendTo(admin_sub);

        admin_sub.appendTo('#admin');
        if (valid_page === true) {
            if (callback && typeof callback == "function") {
                callback(null, $this);
            }
        } else {
            location.assign('/index.html');
        }
        var menu_item = $('#menu_items').empty();
        menu_item.append('<li class="active"><a href="/index.html">Home</a></li>');
        menu_item.append('<li><a href="/order.html?gender=male">Men</a></li>');
        menu_item.append('<li><a href="/order.html?gender=female">Women</a></li>');
        // var dropdown_menu_li = $('<li/>').addClass("dropdown").empty();
        // dropdown_menu_li.append('<a class="dropdown-toggle" data-toggle="dropdown" href="/order.html">Nationality</a>');
        // var dropdown_menu_ul = $('<ul/>').addClass("dropdown-menu").attr("id", "menu1").empty();
        // dropdown_menu_ul.append('<li><a href="/order.html?country=ca">Canada</a></li>');
        // dropdown_menu_ul.append('<li><a href="/order.html?country=jm>Jamaica</a></li>');
        // dropdown_menu_ul.append('<li><a href="/order.html?country=mx>Mexico</a></li>');
        // dropdown_menu_ul.append('<li><a href="/order.html?country=tt>Trinidad and Tobago</a></li>');
        // dropdown_menu_ul.append('<li><a href="/order.html?country=us>U.S.A</a></li>');
        // dropdown_menu_ul.append('<li><a href="/order.html?country=uk>U.K</a></li>');
        // dropdown_menu_li.append(dropdown_menu_ul);
        // menu_item.append(dropdown_menu_li);
        menu_item.append('<li><a href="/order.html">Categories</a></li>');
        menu_item.append('<li><a href="/about.html">About</a></li>');
        menu_item.append('<li><a href="/contact.html">Contact</a></li>');
        //menu

        updateShoppingcartDisplay();


    });


    $('#admin').on('click', '#logout', function() {
        g_proudOfMyColorsService.signoff();
        location.assign('/index.html');
    });

    //shopping cart events
    $('#admin').on('click', '#' + g_shoppingCartBtn, function() {
        location.assign('/cart.html');
    });

    $('#shoppingCartCheckout').on('click', '.' + g_shoppingCartBtnClass, function() {
        location.assign('/cart.html');
    });


}
