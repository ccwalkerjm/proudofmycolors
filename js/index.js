//product details
var g_product_details = '<div class=modal-dialog><div class=modal-content><div class=modal-header> <button class=close type=button data-dismiss=modal>×</button><h4 class=modal-title></h4></div><div class=modal-body><div class=row id=productRowId><div class=col-md-12><div class=heading-title> <input type=hidden id=productId><h3><span class=item_name id=productName>Trinidad and Tobago Disc Flag Tshirt</span></h3></div><div class=row><div class="col-md-8 col-sm-8"> <img id="productImg" style="width:100%"></div><div class="col-md-4 col-sm-4"><div class=single-desc><form><table id=productDetails><tr class=hidden-xs><td><strong>Availability</strong></td><td>:</td><td id=availability>In Stock</td></tr><tr><td colspan=3><span class="item_price price"></span></td></tr><tr><td><strong>Size</strong></td><td>:</td><td> <select class="form-control item_size"></select></td></tr><tr><td><strong>Quantity</strong></td><td>:</td><td> <input type=number class="form-control item_Quantity" value=1></td></tr><tr><strong>Details</strong></tr><tr><div id=productDescription></div></tr><tr><td colspan=3> <button class="btn btn-primary btn-sm item_add" type=button>Add to Cart</button></td></tr></table></form></div></div></div></div></div></div><div class=modal-footer> <button class="btn btn-default" type=button data-dismiss=modal>Close</button></div></div></div>';
var _productModal = $('#productModal');
var g_domainKey = "f2464c5a-ad53-40ab-bb29-b368ba2d7eb1";

//privacy policy


//backend service
var g_courserv_web_service; // = new courserv_web_service()

var g_shoppingCartBtnClass = "shoppingCartBtnClass";
var g_shopping_cart_key_name = "_courserv_shopping_cart_key_0001";
//widget//
//paypal Now Accepting PayPal
var paypal_widget = '<!-- PayPal Logo --><table border="0" cellpadding="10" cellspacing="0" align="center"><tr><td align="center"></td></tr><tr><td align="center"><a href="https://www.paypal.com/webapps/mpp/paypal-popup" title="How PayPal Works" onclick="javascript:window.open("https://www.paypal.com/webapps/mpp/paypal-popup", "WIPaypal", "toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=yes, resizable=yes, width=1060, height=700"); return false;"><img src="https://www.paypalobjects.com/webstatic/mktg/logo/bdg_now_accepting_pp_2line_w.png" border="0" alt="Now Accepting PayPal"></a><div style="text-align:center"><a href="https://www.paypal.com/webapps/mpp/how-paypal-works"><font size="2" face="Arial" color="#0079CD">How PayPal Works</font></a></div></td></tr></table><!-- PayPal Logo -->';

var g_valid_countries = [];
g_valid_countries.push({
    "code": "",
    "name": ""
});
g_valid_countries.push({
    "code": "US",
    "name": "United States"
});
g_valid_countries.push({
    "code": "CA",
    "name": "Canada"
});
g_valid_countries.push({
    "code": "JM",
    "name": "Jamaica"
});
g_valid_countries.push({
    "code": "MX",
    "name": "Mexico"
});
g_valid_countries.push({
    "code": "BRB",
    "name": "Barbados"
});
g_valid_countries.push({
    "code": "GUY",
    "name": "Guyana"
});
g_valid_countries.push({
    "code": "HTI",
    "name": "Haiti"
});
g_valid_countries.push({
    "code": "DOM",
    "name": "Dominican Republic"
});
g_valid_countries.push({
    "code": "GRD",
    "name": "Grenada"
});
g_valid_countries.push({
    "code": "PRI",
    "name": "Puerto Rico"
});
g_valid_countries.push({
    "code": "TTO",
    "name": "Trinidad and Tobago"
});
g_valid_countries.push({
    "code": "GBR",
    "name": "United Kingdom"
});



var _$message;

function getProductTemplate() {
    var product = {};
    product.description = "";
    product.productName = "";
    product.productId = 0;
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

function emptyShoppingCart() {
    sessionStorage.removeItem(g_shopping_cart_key_name);
    updateShoppingcartDisplay();
}

function getProduct(productId, productSize) {
    var productIndex = -1;
    var x_shopping_cart_list = getShoppingCart();
    for (var i = 0; i < x_shopping_cart_list.length; i++) {
        if (productId == x_shopping_cart_list[i].productId && productSize == x_shopping_cart_list[i].size) {
            productIndex = i;
            break;
        }
    }
    if (productIndex >= 0)
        return x_shopping_cart_list[productIndex];
}

function addToCart(product) {
    var productExits = false;
    var x_shopping_cart_list = getShoppingCart();
    for (var i = 0; i < x_shopping_cart_list.length; i++) {
        if (product.productId == x_shopping_cart_list[i].productId && product.size == x_shopping_cart_list[i].size) {
            if (product.quantity <= 0) {
                x_shopping_cart_list.splice(i, 1);
            } else {
                x_shopping_cart_list[i].quantity = product.quantity;
            }
            productExits = true;
            break;
        }
    }

    if (!productExits && product.quantity > 0) {
        x_shopping_cart_list.push(product);
    }
    setShoppingCart(x_shopping_cart_list);
    updateShoppingcartDisplay();
}

function removeFromCart(product) {
    var x_shopping_cart_list = getShoppingCart();
    for (var i = 0; i < x_shopping_cart_list.length; i++) {
        if (product.productId == x_shopping_cart_list[i].productId && product.size == x_shopping_cart_list[i].size) {
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
    var cartStatus = $('#cart-status').empty();
    if (cartStatus.length > 0) { //x_shopping_cart_list.length
        var cart_status_hidden = $('<div/>').addClass("hidden-xs");
        cart_status_hidden.append('<h4><a href="/cart.html">Cart</a></h4>');
        cart_status_hidden.append('<p><strong>' + x_shopping_cart_list.length + ' Product' + (x_shopping_cart_list.length > 1 ? 's' : '') + '</strong></p>');
        cart_status_hidden.appendTo(cartStatus);
        var cart_status_visible = $('<div/>').addClass("visible-xs");

        var cart_status_visible_link = $('<a/>').attr('href', "/cart.html").addClass('btn btn-primary');
        var cart_status_visible_span = $('<span/>').addClass("cart-item").html(x_shopping_cart_list.length);
        cart_status_visible_link.append(cart_status_visible_span);
        cart_status_visible_link.append('<i class="fa fa-shopping-cart"></i>');
        cart_status_visible_link.appendTo(cart_status_visible);
        cart_status_visible.appendTo(cartStatus);
    }

    //populate widget
    var shoppingCartWidget = $('#shoppingCartWidget');
    if (shoppingCartWidget.length > 0) {
        shoppingCartWidget.removeClass().addClass('widget').empty();
        //shoppingCartWidget.append(paypal_widget).append("<br/>");
        var widgetTitle = $("<div/>").addClass('widget-title');
        widgetTitle.append("<h3>Shopping Cart</h3>").appendTo(shoppingCartWidget);
        var productListHolder = $("<ul/>").addClass("cart list-unstyled");
        var total = 0;
        for (var i = 0; i < x_shopping_cart_list.length; i++) {
            var item_li = $("<li/>");
            var item_row = $("<div/>").addClass("row");
            //description
            var item_description = $("<div/>").addClass("col-sm-7 col-xs-7").append(x_shopping_cart_list[i].quantity);
            item_description.append("&nbsp;");
            var _productId = $('<input/>').addClass('productId').attr('type', 'hidden');
            _productId.val(x_shopping_cart_list[i].productId).appendTo(item_description);
            var item_description_a = $("<a/>").attr("href", "#").html(x_shopping_cart_list[i].productName + '-');
            var item_size = $("<span/>").addClass('size').html(x_shopping_cart_list[i].size).appendTo(item_description_a);
            item_description_a.appendTo(item_description);
            //pricing
            var item_pricing = $("<div/>").addClass("col-sm-5 col-xs-5 text-right");
            var item_total = x_shopping_cart_list[i].quantity * x_shopping_cart_list[i].price;
            var item_pricing_bold = $("<strong/>").html(accounting.formatMoney(item_total)).appendTo(item_pricing);
            var delete_link = $("<a/>").attr("href", "#").addClass('delete');
            var delete_icon = $("<i/>").addClass("fa fa-trash-o").appendTo(delete_link);
            delete_link.appendTo(item_pricing);
            item_row.append(item_description);
            item_row.append(item_pricing);
            item_li.append(item_row).appendTo(productListHolder);
            total += item_total;
        }
        var total_li = $("<li/>").append("<br/><hr/>");
        var total_row = $("<div/>").addClass("row");
        var total_description = $("<div/>").addClass("col-sm-7 col-xs-7");
        var total_description_a = $("<a/>").attr("href", "#").html('Total:').appendTo(total_description);
        var total_pricing = $("<div/>").addClass("col-sm-5 col-xs-5 text-right");
        var total_pricing_bold = $("<strong/>").html(accounting.formatMoney(total)).appendTo(total_pricing);
        total_row.append(total_description);
        total_row.append(total_pricing);
        total_li.append(total_row).appendTo(productListHolder);

        shoppingCartWidget.append(productListHolder);
        //delete
        shoppingCartWidget.on("click", ".delete", function() {
            var closestRow = $(this).closest('li');
            var productId = parseInt(closestRow.find('.productId').val());
            var productSize = closestRow.find('.size').text();
            var product = getProduct(productId, productSize);
            removeFromCart(product);
        });
    }

    //Checkout
    var shoppingCartCheckout = $('#shoppingCartCheckout');
    if (shoppingCartCheckout.length > 0 && x_shopping_cart_list.length > 0) {
        shoppingCartCheckout.removeClass().addClass('widget').empty();
        //var shoppingCartCheckoutTitle = $("<div/>").addClass('widget-title');
        //shoppingCartCheckoutTitle.append("<h3>Confirm Cart</h3>").appendTo(shoppingCartCheckout);

        var shoppingCartCheckoutBtn = $("<button/>");
        shoppingCartCheckoutBtn.addClass("btn btn-primary");
        shoppingCartCheckoutBtn.addClass(g_shoppingCartBtnClass);
        shoppingCartCheckoutBtn.html('<span class="glyphicon glyphicon-shopping-cart"></span>Checkout');
        shoppingCartCheckoutBtn.appendTo(shoppingCartCheckout);
    }

    //populate shopping cart
    var shoppingCartTable = $('#shoppingCartTable tbody').empty();
    if (shoppingCartTable.length > 0) {
        var total2 = 0;
        for (var k = 0; k < x_shopping_cart_list.length; k++) {
            var $tr = $('<tr/>');
            //img cell
            var imgCell = $('<td/>');
            var img = $('<img/>').addClass('img-cart').attr('src', x_shopping_cart_list[k].smallImageName);
            img.appendTo(imgCell);
            imgCell.appendTo($tr);

            //type cell
            var typeCell = $('<td/>');
            var productName = $('<strong/>').text(x_shopping_cart_list[k].productName);
            productName.appendTo(typeCell);
            var size_p = $('<p/>').html('Size : <span class="size">' + x_shopping_cart_list[k].size + '</span>');
            size_p.appendTo(typeCell);
            typeCell.appendTo($tr);

            //quantity cell
            var quantityCell = $('<td/>');
            var quantitySection = $('<div/>').addClass('form-inline');
            var quantityInput = $('<input/>').addClass('form-control quantity').attr('type', 'number');
            quantityInput.val(x_shopping_cart_list[k].quantity).appendTo(quantitySection);
            var _productId2 = $('<input/>').addClass('productId').attr('type', 'hidden');
            _productId2.val(x_shopping_cart_list[k].productId).appendTo(quantitySection);
            var updateBtn = $('<button/>').addClass('btn btn-default update').attr('rel', 'tooltip');
            updateBtn.attr('title', 'Update');
            var update_i = $('<i/>').addClass('fa fa-pencil').appendTo(updateBtn);
            updateBtn.appendTo(quantitySection);
            var deleteBtn = $('<a/>').addClass('btn btn-primary delete').attr('rel', 'tooltip');
            deleteBtn.attr("href", "#").attr('title', 'Delete');
            var delete_i = $('<i/>').addClass('fa fa-trash-o').appendTo(deleteBtn);
            deleteBtn.appendTo(quantitySection);
            quantitySection.appendTo(quantityCell);
            quantityCell.appendTo($tr);
            //price cell
            var priceFormat = accounting.formatMoney(x_shopping_cart_list[k].price);
            var priceCell = $('<td/>').html(priceFormat).appendTo($tr);
            var item_total2 = x_shopping_cart_list[k].quantity * x_shopping_cart_list[k].price;
            var itemTotalCell = $('<td/>').html(accounting.formatMoney(item_total2)).appendTo($tr);
            //create row
            shoppingCartTable.append($tr);
            total2 += item_total2;
        }
        shoppingCartTable.append('<tr><td colspan="6">&nbsp;</td></tr>');
        //summary
        var $total_tr = $('<tr/>');
        //img cell
        var total_description_cell = $('<td/>').attr('colspan', '4').addClass('text-right');
        total_description_cell.html('Total Product').appendTo($total_tr);
        var total_amount_cell = $('<td/>').html(accounting.formatMoney(total2)).appendTo($total_tr);
        shoppingCartTable.append($total_tr);
        //set events
        //update
        shoppingCartTable.on("click", ".update", function() {
            var closestRow = $(this).closest('tr');
            var qty = parseInt(closestRow.find('.quantity').val());
            var productId = parseInt(closestRow.find('.productId').val());
            var productSize = closestRow.find('.size').text();
            var product = getProduct(productId, productSize);
            product.quantity = qty;
            addToCart(product);
        });

        //delete
        shoppingCartTable.on("click", ".delete", function() {
            var closestRow = $(this).closest('tr');
            var qty = parseInt(closestRow.find('.quantity').val());
            var productId = parseInt(closestRow.find('.productId').val());
            var productSize = closestRow.find('.size').text();

            var product = getProduct(productId, productSize);
            product.quantity = qty;
            removeFromCart(product);
        });
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
        while (r) {
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

function isAccountPage(pagePath) {
    if (pagePath == '/admin/manage_users.html' ||
        pagePath == '/admin/manage_products.html' ||
        pagePath == '/admin/manage_orders.html' ) {
        return true;
    }
    return false;
}


function DisplayProductDetail(productId) {
    setLoadingState(true);
    g_courserv_web_service.getProduct(g_domainKey, productId, function(err, productItem) {
        setLoadingState(false);
        if (err) {
            display(err.message, true);
            return;
        }

        _productModal.html(g_product_details);
        _productModal.find('#productId').val(JSON.stringify(productItem));
        _productModal.find('#productDescription').html('<p>' + productItem.description + '</p>');
        _productModal.find('#productName').text(productItem.productName);
        _productModal.find('#productImg').attr("src", productItem.largeImageName);
        _productModal.find('.item_price').text(accounting.formatMoney(productItem.price));

        var sizes = _productModal.find('.item_size').empty();
        sizes.append('<option value="S">S</option>');
        sizes.append('<option value="M">M</option>');
        sizes.append('<option value="L">L</option>');
        sizes.append('<option value="XL">XL</option>');
        if (productItem.category1 == "male") {
            sizes.append('<option value="XXL">XXL</option>');
        }

        if (productItem.availability === 0) {
            _productModal.find('#availability').text("Out of Stock");
        } else {
            _productModal.find('#availability').text("In Stock");
        }
        _productModal.modal("show");

        //
    });

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

    g_courserv_web_service = new courserv_web_service(function(err, $this) {
        setLoadingState(false);
        if (err) {
            g_courserv_web_service.signoff();
            location.assign('/index.html');
            return;
        }

        if ($this.getUsername()) {
            $this.getRole(g_domainKey, function(err, role) {
                loadMenuItems($this.getProfile().email, role);
                if (callback && typeof callback == "function") {
                    callback(null, $this);
                }
            });
        } else if (!isAccountPage(location.pathname)) {
            loadMenuItems();
            if (callback && typeof callback == "function") {
                callback(null, $this);
            }
        } else {
            location.assign('/index.html');
        }
    });


    function loadMenuItems(displayedName, role) {
        //not signed in
        var menu_item = $('#menu_items').empty();
        //<li class="active">
        menu_item.append('<li><a href="/index.html">Home</a></li>');
        menu_item.append('<li><a href="/products.html?gender=male">Men</a></li>');
        menu_item.append('<li><a href="/products.html?gender=female">Women</a></li>');
        menu_item.append('<li><a href="/products.html">Categories</a></li>');
        ////
        var accountSection = $('#your-account').empty();
        var accountStatus = $('<div/>').addClass('hidden-xs');
        var accountHeader = $('<h4/>');
        var visible_xs = $('<div/>').addClass("visible-xs");
        if (displayedName) {
            accountHeader.html('<a href="/admin/changePassword.html">' + displayedName + '</a>');
            accountHeader.appendTo(accountStatus);
            accountStatus.append('<p><a href="#" id="logout">Logout</a><p>');
            visible_xs.html('<a href="#" id="logout" class="btn btn-primary"><i class="fa fa-sign-out"></i></a>');
            menu_item.append('<li><a href="/orders.html">Orders</a></li>');
            if (role) {

                var dropdown = $('<li/>');
                dropdown.append('<a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">Admin <span class="caret"></span></a>');
                var $ul = $('<ul/>').addClass('dropdown-menu');
                $ul.append('<li><a href="/admin/manage_products.html">Manage Products</a></li>');
                $ul.append('<li><a href="/admin/manage_orders.html">Manage Orders</a></li>');
                dropdown.append($ul);
                menu_item.append(dropdown);

            }
        } else {
            accountHeader.html('<a href="/admin/account.html">Account</a>');
            accountHeader.appendTo(accountStatus);
            accountStatus.append('<p>Welcome</p>');
            visible_xs.html('<a href="/admin/account.html" class="btn btn-primary"><i class="fa fa-user"></i></a>');
        }
        accountStatus.appendTo(accountSection);
        accountSection.append(visible_xs);
        menu_item.append('<li><a href="/about.html">About</a></li>');
        menu_item.append('<li><a href="/contact.html">Contact</a></li>');
        //menu

        //update shopping cart
        updateShoppingcartDisplay();
    }

    $('.product-container').on("click", ".product-item", function() {
        //g_product_details
        var productItem = $(this);
        var productId = productItem.data('product_id');
        if (_productModal.length > 0) {
            DisplayProductDetail(productId);
        } else {
            location.assign("/product_detail.html?id=" + productId);
        }
    });

    $('.product-container').on("click", ".productBtn", function() {
        //g_product_details
        var productItem = $(this).closest(".product-item");
        var productId = productItem.data('product_id');
        if (_productModal.length > 0) {
            DisplayProductDetail(productId);
        } else {
            location.assign("/product_detail.html?id=" + productId);
        }
    });

    $('#your-account').on('click', '#logout', function() {
        g_courserv_web_service.signoff();
        location.assign('/index.html');
    });

    //shopping cart events
    $('#shoppingCartCheckout').on('click', '.' + g_shoppingCartBtnClass, function() {
        location.assign('/cart.html');
    });

    //add to Cart
    _productModal.on('click', '.item_add', function() {
        var productRow = $(this).closest("#productRowId");
        var productItem = _productModal.find("#productId").val();
        productItem = JSON.parse(productItem);
        productItem.quantity = productRow.find(".item_Quantity").val();
        productItem.size = productRow.find(".item_size").val();
        addToCart(productItem);
        _productModal.modal("hide");
        //alert(productItem.data('product_id'));
    });


}
