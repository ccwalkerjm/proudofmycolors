//'use strict';
/*jshint esversion: 6 */
/*jslint nomen: true */
// Class definition

var courserv_web_service = (function() {
    //created October 3, 2016
    'use strict';
    const IDENTITY_POOL = 'us-east-1:ae6eb452-cb15-421c-b0e3-0279c239235a';
    const USER_POOL_ID = 'us-east-1_WPOO9sn0r';
    const CLIENT_ID = '5006ojp6nu600vt64p4i31kvij';

    const AWS_REGION = 'us-east-1';
    //private properties and methods
    var _profile;

    var _creds = new AWS.CognitoIdentityCredentials({
        IdentityPoolId: IDENTITY_POOL
    });

    var _poolData = {
        UserPoolId: USER_POOL_ID,
        ClientId: CLIENT_ID
    };

    // Initialize the Amazon Cognito credentials provider
    AWS.config.region = AWS_REGION; // Region
    AWS.config.credentials = _creds;

    AWSCognito.config.region = AWS_REGION;
    AWSCognito.config.credentials = _creds;

    AWSCognito.config.update({
        accessKeyId: 'anything',
        secretAccessKey: 'anything'
    });

    var _userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(_poolData);
    var _cognitoUser = _userPool.getCurrentUser();

    //services
    var _lambda = new AWS.Lambda();
    var _dynamodb = new AWS.DynamoDB({
        apiVersion: '2012-08-10'
    });




    //private methods
    //Get auth details for lambda authentication
    var _getAuth = function() {
        var auth = {};
        if (_cognitoUser) {
            auth.username = _cognitoUser.username;
            auth.signInUserSession = _cognitoUser.signInUserSession;
        }
        return auth;
    };

    //process response from lambda
    function processLambdaData(err, resp, callback) {
        if (err) return;
        resp = JSON.parse(resp.Payload);
        if (resp && resp.errorMessage) {
            //transform errorMessage
            var newMessage = resp.errorMessage;
            err = new Error(newMessage);
            resp = null;
        }
        if (resp == 'null') {
            resp = null;
        }
        callback(err, resp);
    }

    //set Credentials
    var _setCredentials = function(session, callback) {
        if (session && session.isValid()) {
            var idToken = session.getIdToken().getJwtToken();
            var provider_name = 'cognito-idp.' + AWS_REGION + '.amazonaws.com/' + USER_POOL_ID;
            _creds.params.Logins = {};
            _creds.params.Logins[provider_name] = idToken;
            _creds.expired = true;
            //AWS.config.credentials = _creds;
            //AWSCognito.config.credentials = _creds;
            console.log(_creds);
            _profile = parseJwt(idToken);
            if (AWS.config.credentials.needsRefresh()) {
                AWS.config.credentials.refresh(function(err) {
                    console.log(_creds);
                    callback(err);
                });
            } else {
                callback();
            }
        } else {
            callback();
        }
    };


    //transform dynamodb fields
    function getS(value) {
        try {
            return value.S;
        } catch (err) {
            return "";
        }
    }

    function getN(value) {
        try {
            return value.N;
        } catch (err) {
            return 0;
        }
    }


    function getBool(value) {
        try {
            var valueN = parseInt(value.N);
            return valueN == 1;
        } catch (err) {
            return false;
        }
    }

    function parseJwt(token) {
        var base64Url = token.split('.')[1];
        var base64 = base64Url.replace('-', '+').replace('_', '/');
        return JSON.parse(window.atob(base64));
    }

    var logout = function() {
        _cognitoUser.signOut();
        _cognitoUser = null;
        AWS.config.credentials.clearCachedId();
    };

    //constructor
    function courserv_web_service(callback) {
        var $this = this;
        _cognitoUser = _userPool.getCurrentUser();
        if (_cognitoUser === null) {
            if (callback && typeof callback == "function") {
                callback(null, $this);
            }
            return;
        }
        _cognitoUser.getSession(function(err, session) {
            if (err) {
                console.log(err);
                logout();
                callback(new Error('Account has expired!. Please login again!')); //   null, $this);
            } else {
                _setCredentials(session, function(err) {
                    if (callback && typeof callback == "function") {
                        callback(err, $this);
                    }
                });
            }
        });
    }


    var getBaseUrl = function() {
        var getUrl = window.location;
        return getUrl.protocol + "//" + getUrl.host + "/"; // + getUrl.pathname.split('/')[1];
    };


    //public methods
    courserv_web_service.prototype.setCredentials = function(callback) {
        AWS.config.credentials.get(function(err) {
            if (err) {
                console.log(err);
                callback(err);
            } else {
                console.log(_creds);
                callback(null, _creds);
            }
        });

    };


    courserv_web_service.prototype.getProfile = function() {
        return _profile;
    };

    courserv_web_service.prototype.getUsername = function() {
        if (_cognitoUser === null || _cognitoUser.signInUserSession === null) {
            return null;
        } else {
            return _cognitoUser.getUsername();
        }

    };



    // Instance methods
    courserv_web_service.prototype.signoff = function() {
        if (_cognitoUser !== null) {
            logout();
        }
    };


    courserv_web_service.prototype.signup = function(userData, callback) {
        var attributeList = [];

        attributeList.push(new AWSCognito.CognitoIdentityServiceProvider.CognitoUserAttribute({
            Name: 'email',
            Value: userData.email
        }));
        attributeList.push(new AWSCognito.CognitoIdentityServiceProvider.CognitoUserAttribute({
            Name: 'birthdate',
            Value: userData.birthdate
        }));
        attributeList.push(new AWSCognito.CognitoIdentityServiceProvider.CognitoUserAttribute({
            Name: 'gender',
            Value: userData.gender
        }));

        attributeList.push(new AWSCognito.CognitoIdentityServiceProvider.CognitoUserAttribute({
            Name: 'given_name',
            Value: userData.given_name
        }));

        attributeList.push(new AWSCognito.CognitoIdentityServiceProvider.CognitoUserAttribute({
            Name: 'family_name',
            Value: userData.family_name
        }));

        //using attributeList for null...
        _userPool.signUp(userData.username, userData.password, attributeList, null, function(err, result) {
            if (err) {
                console.log(err);
                callback(err);
            }
            if (result) {
                _cognitoUser = result.user;
                callback(null, result);
            }
        });
    };


    courserv_web_service.prototype.confirmSignup = function(username, verificationCode, callback) {
        var userData = {
            Username: username,
            Pool: _userPool
        };
        _cognitoUser = new AWSCognito.CognitoIdentityServiceProvider.CognitoUser(userData);

        _cognitoUser.confirmRegistration(verificationCode, true, function(err, result) {
            callback(err, result);
        });
    };


    courserv_web_service.prototype.signin = function(username, password, callback) {
        var $this = this;
        var trimmedUsername = username.trim();
        console.log(_creds);
        var authenticationData = {
            Username: trimmedUsername,
            Password: password
        };
        var authenticationDetails = new AWSCognito.CognitoIdentityServiceProvider.AuthenticationDetails(authenticationData);

        var userData = {
            Username: trimmedUsername,
            Pool: _userPool
        };
        _cognitoUser = new AWSCognito.CognitoIdentityServiceProvider.CognitoUser(userData);

        _cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: function(result) {
                _setCredentials(result, function(err) {
                    callback(null, false, $this);
                });
            },
            onFailure: function(err) {
                //_cognitoUser = null;
                callback(err);
            },
            newPasswordRequired: function(userAttributes, requiredAttributes) {
                callback(null, true, this, userAttributes, requiredAttributes);
            }
        });
    };

    //completeChallenge
    courserv_web_service.prototype.completeChallenge = function(newPassword, user, $this) {
        _cognitoUser.completeNewPasswordChallenge(newPassword, user, $this);
    };

    //change password for logon user
    courserv_web_service.prototype.changePassword = function(oldPassword, newPassword, callback) {
        _cognitoUser.changePassword(oldPassword, newPassword, function(err, result) {
            console.log('call result: ' + result);
            callback(err);
        });
    };

    //completeChallenge
    courserv_web_service.prototype.completeChallenge = function(newPassword, user, $this) {
        _cognitoUser.completeNewPasswordChallenge(newPassword, user, $this);
    };

    //forgot password
    courserv_web_service.prototype.forgotPassword = function(username, callback) {
        var userData = {
            Username: username,
            Pool: _userPool
        };
        _cognitoUser = new AWSCognito.CognitoIdentityServiceProvider.CognitoUser(userData);
        _cognitoUser.forgotPassword({
            onSuccess: function(result) {
                callback(null, false, result);
            },
            onFailure: function(err) {
                _cognitoUser = null;
                callback(err);
            },
            inputVerificationCode: function() {
                callback(null, true, this);
            }
        });
    };

    //confirm-- forgot password
    courserv_web_service.prototype.confirmPassword = function(verificationCode, newPassword, $this) {
        _cognitoUser.confirmPassword(verificationCode, newPassword, $this);
    };


    var lambdaJsonValue = function(data) {
        return JSON.parse(data.Payload);
    };


    //admin only
    courserv_web_service.prototype.getSite = function(domainKey, callback) {
        var jsonRequest = {};
        jsonRequest.request = {};
        jsonRequest.request.cmd = 'getSite';
        jsonRequest.request.domainKey = domainKey;
        jsonRequest.auth = _getAuth();
        var params = {
            FunctionName: 'courserv_manage_site',
            Payload: JSON.stringify(jsonRequest)
        };
        _lambda.invoke(params, function(err, data) {
            processLambdaData(err, data, function(newErr, payload) {
                if (newErr) return callback(newErr);
                var item = {};
                item.name = getS(payload.Item.name);
                item.description = getS(payload.Item.description);
                item.domainKey = getS(payload.Item.domainKey);
                item.bucket = getS(payload.Item.bucket);
                item.type = getS(payload.Item.type);
                item.prefix = getS(payload.Item.prefix);
                if (payload.Item.paypalCredentials) {
                    item.paypal = {};
                    item.paypal.username = payload.Item.paypalCredentials.M.username.S;
                    item.paypal.password = payload.Item.paypalCredentials.M.password.S;
                    item.paypal.signature = payload.Item.paypalCredentials.M.signature.S;
                    item.paypal.live = payload.Item.paypalCredentials.M.live.BOOL;
                }
                item.emailAddresses = [];
                if (payload.Item.emailForwarderList) {
                    for (var j = 0; j < payload.Item.emailForwarderList.L.length; j++) {
                        var emailAddress = {};
                        emailAddress.local_part = payload.Item.emailForwarderList.L[j].M.local_part.S;
                        emailAddress.toAddresses = payload.Item.emailForwarderList.L[j].M.toAddresses ? payload.Item.emailForwarderList.L[j].M.toAddresses.S : "";
                        emailAddress.catchAll = payload.Item.emailForwarderList.L[j].M.catchAll.BOOL;
                        item.emailAddresses.push(emailAddress);
                    }
                }
                callback(null, item);
            });

        });
    };

    courserv_web_service.prototype.listSites = function(callback) {
        var jsonRequest = {};
        jsonRequest.request = {
            'cmd': 'listSites'
        };
        jsonRequest.auth = _getAuth();
        var params = {
            FunctionName: 'courserv_manage_site',
            Payload: JSON.stringify(jsonRequest)
        };
        _lambda.invoke(params, function(err, data) {
            processLambdaData(err, data, function(newErr, newResp) {
                if (newResp === null) newResp = [];
                callback(newErr, newResp);
            });
        });
    };

    courserv_web_service.prototype.createSite = function(data, callback) {
        var jsonRequest = {};
        jsonRequest.request = {};
        jsonRequest.request.cmd = 'createSite';
        jsonRequest.request.data = data;
        jsonRequest.auth = _getAuth();
        var params = {
            FunctionName: 'courserv_manage_site',
            Payload: JSON.stringify(jsonRequest)
        };
        _lambda.invoke(params, function(err, data) {
            processLambdaData(err, data, function(newErr, newResp) {
                callback(newErr, newResp);
            });
        });
    };

    //get Role
    courserv_web_service.prototype.getRole = function(domainKey, callback) {
        var jsonRequest = {};
        jsonRequest.request = {};
        jsonRequest.request.cmd = 'getRole';
        jsonRequest.request.domainKey = domainKey;
        jsonRequest.auth = _getAuth();
        var params = {
            FunctionName: 'courserv_manage_site',
            Payload: JSON.stringify(jsonRequest)
        };
        _lambda.invoke(params, function(err, data) {
            processLambdaData(err, data, function(newErr, newResp) {
                callback(newErr, newResp);
            });
        });
    };


    //list orders
    courserv_web_service.prototype.listOrders = function(domainKey, callback) {
        var jsonRequest = {};
        jsonRequest.request = {};
        jsonRequest.request.cmd = 'listOrders';
        jsonRequest.request.domainKey = domainKey;
        jsonRequest.auth = _getAuth();
        var params = {
            FunctionName: 'courserv_manage_site',
            Payload: JSON.stringify(jsonRequest)
        };
        _lambda.invoke(params, function(err, data) {
            processLambdaData(err, data, function(newErr, payload) {
                if (newErr) return callback(newErr);
                var orders = [];
                if (payload === null) payload = [];
                for (var i = 0; i < payload.Items.length; i++) {
                    var order = {};
                    order.amt = getN(payload.Items[i].amt);
                    order.status = getS(payload.Items[i].status);
                    order.created = parseInt(getN(payload.Items[i].created));
                    order.items = JSON.stringify(payload.Items[i].items.L);
                    order.orderNo = getN(payload.Items[i].orderNo);
                    orders.push(order);
                }
                callback(null, orders);
            });
        });
    };

    //manage orders
    courserv_web_service.prototype.manageOrders = function(domainKey, dateFrom, dateTo, callback) {
        var jsonRequest = {};
        jsonRequest.request = {};
        jsonRequest.request.cmd = 'manageOrders';
        jsonRequest.request.domainKey = domainKey;
        jsonRequest.request.dateFrom = dateFrom;
        jsonRequest.request.dateTo = dateTo;
        jsonRequest.auth = _getAuth();
        var params = {
            FunctionName: 'courserv_manage_site',
            Payload: JSON.stringify(jsonRequest)
        };
        _lambda.invoke(params, function(err, data) {
            processLambdaData(err, data, function(newErr, payload) {
                if (newErr) return callback(newErr);
                var orders = [];
                if (payload === null) payload = [];
                for (var i = 0; i < payload.Items.length; i++) {
                    var order = {};
                    order.amt = getN(payload.Items[i].amt);
                    order.items_amt = getN(payload.Items[i].items_amt);
                    order.ship_amt = getN(payload.Items[i].ship_amt);
                    order.tax_amt = getN(payload.Items[i].tax_amt);
                    order.status = getS(payload.Items[i].status);
                    order.created = parseInt(getN(payload.Items[i].created));
                    order.items = JSON.stringify(payload.Items[i].items.L);
                    order.orderNo = getN(payload.Items[i].orderNo);
                    order.trackingNo = getS(payload.Items[i].trackingNo);
                    order.timeUpdated = getS(payload.Items[i].timeUpdated);
                    order.shippingAddress = payload.Items[i].shippingAddress.M;
                    orders.push(order);
                }
                callback(null, orders);
            });
        });
    };

    //manage orders
    courserv_web_service.prototype.initTracking = function(input, callback) {
        var jsonRequest = {};
        jsonRequest.request = {};
        jsonRequest.request.cmd = 'initTracking';
        jsonRequest.request.domainKey = input.domainKey;
        jsonRequest.request.orderNo = input.orderNo;
        jsonRequest.request.trackingNo = input.trackingNo;
        jsonRequest.auth = _getAuth();
        var params = {
            FunctionName: 'courserv_manage_site',
            Payload: JSON.stringify(jsonRequest)
        };
        _lambda.invoke(params, function(err, data) {
            processLambdaData(err, data, function(newErr, role) {
                if (newErr) return callback(newErr);
                callback(null);
            });
        });
    };


    //update paypal credentials
    courserv_web_service.prototype.updateEmailForwarder = function(domainKey, emailForwarders, callback) {
        var jsonRequest = {};
        jsonRequest.request = {};
        jsonRequest.request.cmd = 'updateEmailForwarder';
        jsonRequest.request.domainKey = domainKey;
        jsonRequest.request.emailForwarders = emailForwarders;
        jsonRequest.auth = _getAuth();
        var params = {
            FunctionName: 'courserv_manage_site',
            Payload: JSON.stringify(jsonRequest)
        };
        _lambda.invoke(params, function(err, data) {
            processLambdaData(err, data, function(newErr, newResp) {
                callback(newErr, newResp);
            });
        });
    };

    //update paypal credentials
    courserv_web_service.prototype.updatePaypal = function(domainKey, paypal, callback) {
        var jsonRequest = {};
        jsonRequest.request = {};
        jsonRequest.request.cmd = 'updatePaypal';
        jsonRequest.request.domainKey = domainKey;
        jsonRequest.request.paypal = paypal;
        jsonRequest.auth = _getAuth();
        var params = {
            FunctionName: 'courserv_manage_site',
            Payload: JSON.stringify(jsonRequest)
        };
        _lambda.invoke(params, function(err, data) {
            processLambdaData(err, data, function(newErr, newResp) {
                callback(newErr, newResp);
            });
        });
    };

    //upload site to S#
    courserv_web_service.prototype.uploadSite = function(domainKey, file, callback) {
        if (file.type != 'application/zip' && file.type != 'application/x-zip-compressed') {
            callback(new Error("Only ZIP File allowed"));
            return;
        }
        var token = _getAuth().signInUserSession.accessToken.jwtToken;
        var params = {
            Key: 'files/' + domainKey + ".zip",
            ContentType: file.type,
            Body: file,
            ACL: 'private',
            Metadata: {
                "x-amz-meta-domainKey": domainKey,
                "x-amz-meta-token": token,
            },
        };
        var _s3 = new AWS.S3({
            params: {
                Bucket: 'zipsite.courserv.com'
            }
        });
        _s3.putObject(params, function(err, results) {
            callback(err);
        });
    };


    //admin only
    courserv_web_service.prototype.listUsers = function(domainKey, callback) {
        var jsonRequest = {};
        jsonRequest.request = {
            'cmd': 'listUsers',
            'domainKey': domainKey
        };
        jsonRequest.auth = _getAuth();
        var requestSerialized = JSON.stringify(jsonRequest);
        var params = {
            FunctionName: 'courserv_manage_site',
            Payload: requestSerialized
        };
        _lambda.invoke(params, function(err, data) {
            processLambdaData(err, data, function(newErr, newResp) {
                callback(newErr, newResp);
            });
        });
    };

    //admin functions
    //get user
    var jsonRequest = {};
    courserv_web_service.prototype.createProduct = function(domainKey, data, callback) {
        var jsonRequest = {};
        jsonRequest.request = {
            'cmd': 'createProduct',
            'data': data,
            'domainKey': domainKey
        };
        jsonRequest.auth = _getAuth();
        var requestSerialized = JSON.stringify(jsonRequest);
        var params = {
            FunctionName: 'courserv_manage_site',
            Payload: requestSerialized
        };
        _lambda.invoke(params, function(err, data) {
            processLambdaData(err, data, function(newErr, newResp) {
                callback(newErr, newResp);
            });
        });
    };

    courserv_web_service.prototype.updateProduct = function(domainKey, data, callback) {
        var jsonRequest = {};
        jsonRequest.request = {
            'cmd': 'updateProduct',
            'data': data,
            'domainKey': domainKey
        };
        jsonRequest.auth = _getAuth();
        var requestSerialized = JSON.stringify(jsonRequest);
        var params = {
            FunctionName: 'courserv_manage_site',
            Payload: requestSerialized
        };
        _lambda.invoke(params, function(err, data) {
            processLambdaData(err, data, function(newErr, newResp) {
                callback(newErr, newResp);
            });
        });
    };

    //
    courserv_web_service.prototype.deleteProduct = function(domainKey, productId, callback) {
        var jsonRequest = {};
        jsonRequest.request = {
            'cmd': 'deleteProduct',
            'productId': productId,
            'domainKey': domainKey
        };
        jsonRequest.auth = _getAuth();
        var requestSerialized = JSON.stringify(jsonRequest);
        var params = {
            FunctionName: 'courserv_manage_site',
            Payload: requestSerialized
        };
        _lambda.invoke(params, function(err, data) {
            processLambdaData(err, data, function(newErr, newResp) {
                callback(newErr, newResp);
            });
        });
    };



    //public acccess
    //get Product details----public access
    courserv_web_service.prototype.listProducts = function(domainKey, callback) {
        var params = {
            TableName: 'courserv_products',
            KeyConditionExpression: "#keyName = :keyval",
            ExpressionAttributeNames: {
                "#keyName": 'domainKey',
            },
            ExpressionAttributeValues: {
                ":keyval": {
                    "S": domainKey
                },

            },
        };
        _dynamodb.query(params, function(err, data) {
            if (err) {
                console.log(err);
                callback(err);
            } else {
                console.log(data);
                var list = [];
                for (var i = 0; i < data.Items.length; i++) {
                    var result = {};
                    result.productId = data.Items[i].productId.N;
                    result.productName = data.Items[i].productName.S;
                    result.category0 = getS(data.Items[i].category0);
                    result.category1 = getS(data.Items[i].category1);
                    result.price = getN(data.Items[i].price);
                    result.smallImageName = getS(data.Items[i].smallImageName);
                    result.largeImageName = getS(data.Items[i].largeImageName);
                    result.xLargeImageName = getS(data.Items[i].xLargeImageName);
                    result.description = getS(data.Items[i].description);
                    result.availability = getN(data.Items[i].availability);

                    list.push(result);
                }
                callback(null, list);
            }
        });
    };


    //get Product details----public access
    courserv_web_service.prototype.getProduct = function(domainKey, productId, callback) {
        var params = {
            TableName: 'courserv_products',
            Key: {
                domainKey: {
                    S: domainKey
                },
                productId: {
                    N: productId.toString()
                }
            }
        };

        _dynamodb.getItem(params, function(err, data) {
            if (err) {
                console.log(err);
                callback(err);
            } else {
                console.log(data);
                var result = {};
                if (data.Item) {
                    result.productId = data.Item.productId.N;
                    result.productName = data.Item.productName.S ? data.Item.productName.S : '';
                    result.smallImageName = data.Item.smallImageName ? data.Item.smallImageName.S : '';
                    result.largeImageName = data.Item.largeImageName ? data.Item.largeImageName.S : '';
                    result.xLargeImageName = data.Item.xLargeImageName ? data.Item.xLargeImageName.S : '';
                    result.description = getS(data.Item.description);
                    result.category1 = getS(data.Item.category1);
                    result.availability = getN(data.Item.availability);
                    result.price = getN(data.Item.price);
                    result.category0 = getS(data.Item.category0);
                }
                console.log(result);
                callback(null, result);

            }
        });
    };

    //checkout ---return token--
    courserv_web_service.prototype.paypalCheckout = function(method, data, domainKey, callback) {
        var request = {};
        request.data = data;
        request.method = method;
        request.baseUrl = getBaseUrl();
        request.auth = _getAuth();
        request.domainKey = domainKey;
        var requestSerialized = JSON.stringify(request);
        var params = {
            FunctionName: 'courserv_paypal_checkout',
            Payload: requestSerialized
        };
        _lambda.invoke(params, function(err, data) {
            processLambdaData(err, data, function(newErr, newResp) {
                callback(newErr, newResp);
            });
        });
    };

    //invite user
    courserv_web_service.prototype.inviteUser = function(userInvite, callback) {
        var jsonRequest = {};
        jsonRequest.request = {
            'cmd': 'inviteUser',
            'data': userInvite
        };
        jsonRequest.auth = _getAuth();
        var requestSerialized = JSON.stringify(jsonRequest);
        var params = {
            FunctionName: 'courserv_manage_site',
            Payload: requestSerialized
        };
        _lambda.invoke(params, function(err, data) {
            processLambdaData(err, data, function(newErr, newResp) {
                callback(newErr, newResp);
            });
        });
    };

    //get emails
    courserv_web_service.prototype.listEmails = function(emailAddress, lastKey, callback) {
        var jsonRequest = {};
        jsonRequest.request = {
            'cmd': 'listEmails',
            'emailAddress': emailAddress,
            'lastKey': lastKey
        };
        jsonRequest.auth = _getAuth();
        var requestSerialized = JSON.stringify(jsonRequest);
        var params = {
            FunctionName: 'courserv_manage_site',
            Payload: requestSerialized
        };
        _lambda.invoke(params, function(err, data) {
            processLambdaData(err, data, function(newErr, newResp) {
                callback(newErr, newResp);
            });
        });
    };

    //
    return courserv_web_service;
}());
