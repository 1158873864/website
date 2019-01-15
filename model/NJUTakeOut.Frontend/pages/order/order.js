var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: "",
    avatarUrl: "",
    phone: "",
    commodityTotalPrice: 0.00,
    orderPrice: 0.00,
    eventDiscount: 0.00,
    hour: 11,
    minute: 20,
    address: "",
    addressDetail: "",
    comment: "",
    nowTime: "",
    date: {},

    dialogIsHiden: true,
    canIUse: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var date = new Date();
    this.setData({
      nowTime: date.getHours() + ":" + (date.getMinutes() <= 9 ? "0" + date.getMinutes() : date.getMinutes()),
      date: date,
      hour: date.getHours(),
      minute: date.getMinutes()
    });
    var that = this;

    var userInfo = wx.getStorageSync('userInfo');
    var phone = wx.getStorageSync('phone');
    var address = wx.getStorageSync('address');
    var addressDetail = wx.getStorageSync('addressDetail');
    this.setData({
      userInfo: userInfo,
      phone: phone,
      address: address,
      addressDetail: addressDetail
    })

    var value = wx.getStorageSync("commodityTotalPrice");
    this.setData({
      commodityTotalPrice: value
    })

    wx.request({
      url: app.globalData.backendUrl + "order/price",
      method: "POST",
      header: {
        'Authorization': 'Bearer ' + app.getToken(),
        'content-type': 'application/json'
      },
      data: {
        total: that.data.commodityTotalPrice,
        date: that.data.date,
        address: that.data.address,
        comment: that.data.comment,
        foods: wx.getStorageSync("orderList")
      },
      success: function(res) {
        if (res.statusCode == 200) {
          that.setData({
            eventDiscount: that.data.commodityTotalPrice - res.data.finalPrice
          })
        }
      }
    });
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {
    this.removeStorageSelected();
  },

  /**
   * 选择时间
   */
  chooseTime: function(e) {
    var date = new Date();
    var hour = e.detail.value.split(":")[0];
    var minute = e.detail.value.split(":")[1];
    date.setHours(Number.parseInt(hour));
    date.setMinutes(Number.parseInt(minute));
    this.setData({
      hour: hour,
      minute: minute,
      date: date
    })
  },

  /**
   * 选择地点
   */
  chooseAddress: function(e) {
    var that = this;
    wx.chooseLocation({
      success: function(res) {
        that.setData({
          address: res.name
        })
      },
    })
  },

  bingGetPhoneNumber: function(e) {
    var that = this;
    if (e.detail.errMsg == 'getPhoneNumber:fail user deny') {
      wx.showModal({
        title: '提示',
        showCancel: false,
        content: '未授权',
        success: function(res) {}
      })
    } else {
      wx.checkSession({
        success: function() {
          wx.request({
            url: app.globalData.backendUrl + "getPhoneNumber",
            method: "POST",
            header: {
              'Authorization': 'Bearer ' + app.getToken(),
              'content-type': 'application/json'
            },
            data: {
              encryptData: e.detail.encryptedData,
              sessionKey: wx.getStorageSync("sessionKey"),
              ivCode: e.detail.iv
            },
            success: function(res) {
              if (res.statusCode == 200) {
                that.setData({
                  phone: res.data.phoneNumber
                })
              } else {
                wx.showModal({
                  title: '提示',
                  showCancel: false,
                  content: '手机号获取失败',
                  success: function(res) {
                    that.setData({
                      phone: "1"
                    })
                  }
                })
              }
            }
          });
        },
        fail: function() {
          app.onShow();
        }
      })
    }
  },

  bindGetUserInfo: function(e) {
    this.setData({
      userInfo: e.detail.userInfo.nickName,
      avatarUrl: e.detail.userInfo.avatarUrl
    })
  },

  /**
   * 提交订单
   */
  submitOrder: function(e) {
    if (this.dataCheck()) {
      var that = this;

      if (that.data.avatarUrl.length != 0) {
        wx.request({
          url: app.globalData.backendUrl + "saveAvatar",
          method: "POST",
          header: {
            'Authorization': 'Bearer ' + app.getToken(),
            'content-type': 'application/json'
          },
          data: {
            avatarUrl: that.data.avatarUrl
          }
        });
      }

      var orderList = wx.getStorageSync("orderList");
      //支付并保存订单
      wx.request({
        url: app.globalData.backendUrl + "order",
        method: "PUT",
        header: {
          'Authorization': 'Bearer ' + app.getToken(),
          'content-type': 'application/json'
        },
        data: {
          total: that.data.commodityTotalPrice + that.data.orderPrice - that.data.eventDiscount,
          date: that.data.date,
          address: that.data.address + "-" + that.data.addressDetail,
          comment: that.data.comment,
          foods: orderList,
          phone: that.data.phone
        },
        success: function(res) {
          if (res.statusCode == 200) {
            var requestPaymentParams = res.data;
            wx.requestPayment({
              'timeStamp': requestPaymentParams.timeStamp,
              'nonceStr': requestPaymentParams.nonceStr,
              'package': requestPaymentParams.pakcage,
              'signType': requestPaymentParams.signType,
              'paySign': requestPaymentParams.paySign,
              'success': function(res) {
                wx.request({
                  url: app.globalData.backendUrl + "order/print/" + requestPaymentParams.orderId,
                  method: "POST",
                  header: {
                    'Authorization': 'Bearer ' + app.getToken(),
                    'content-type': 'application/json'
                  },
                  success: function(res) {
                    wx.setStorageSync('userInfo', that.data.userInfo);
                    wx.setStorageSync('phone', that.data.phone);
                    wx.setStorageSync('address', that.data.address);
                    wx.setStorageSync('addressDetail', that.data.addressDetail);
                    if (res.statusCode == 200) {
                      wx.showToast({
                        title: '下单成功',
                        icon: 'success',
                        duration: 1000
                      });
                      wx.switchTab({
                        url: '../orderPreview/orderPreview',
                      })
                    } else {
                      wx.showModal({
                        title: '下单失败',
                        content: '请凭订单联系九餐厅',
                      })
                    }
                  },
                })
              },
              'complete': function(res) {
                console.log(res)
                if (res.errMsg.length != 0 && res.errMsg.indexOf("ok") < 0) {
                  wx.request({
                    url: app.globalData.backendUrl + "order/wait/" + requestPaymentParams.orderId,
                    method: "POST",
                    header: {
                      'Authorization': 'Bearer ' + app.getToken(),
                      'content-type': 'application/json'
                    }
                  })
                  wx.showToast({
                    title: "支付失败",
                  })
                }
              },
            })
          } else if (res.statusCode == 404) {
            wx.showToast({
              title: '菜品未上架',
              icon: 'warn',
              duration: 1000
            });
          }
        }
      });
    }
  },

  /**
   * 返回菜单界面
   */
  backToCart: function(e) {
    wx.switchTab({
      url: "../index/index",
    });
  },

  /**
   * 删除缓存
   */
  removeStorageSelected: function() {
    wx.removeStorage({
      key: "orderList",
      success: function(res) {
        console.log(res.data)
      }
    });
    wx.removeStorage({
      key: "commodityTotalPrice",
      success: function(res) {
        console.log(res.data)
      }
    });
  },

  onAddressDetailInput: function(e) {
    this.setData({
      addressDetail: e.detail.value
    })
  },

  onCommentInput: function(e) {
    this.setData({
      comment: e.detail.value
    })
  },

  onPhoneInput: function(e) {
    this.setData({
      phone: e.detail.value
    })
  },

  closeDialog: function(e) {
    this.setData({
      dialogIsHiden: true
    });
    this.submitOrder(e);
  },

  dataCheck: function(e) {
    if (this.data.userInfo.length == 0) {
      wx.showModal({
        title: '信息不完整',
        content: '请填写顾客信息',
      })
      return false;
    } else if (this.data.phone.length == 0) {
      wx.showModal({
        title: '信息不完整',
        content: '请填写电话号码',
      })
      return false;
    } else if (this.data.commodityTotalPrice == 0.00 || !this.data.commodityTotalPrice) {
      wx.showModal({
        title: '信息不完整',
        content: '请点餐',
      })
      return false;
    } else if (this.data.address.length == 0) {
      wx.showModal({
        title: '信息不完整',
        content: '请填写地址',
      })
      return false;
    } else if (this.data.date.length == 0) {
      wx.showModal({
        title: '信息不完整',
        content: '请填写时间',
      })
      return false;
    }
    return true;
  }
})