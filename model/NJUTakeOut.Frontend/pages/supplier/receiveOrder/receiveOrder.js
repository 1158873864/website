var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    orders: [{
      total: 0.0,
      date: new Date(),
      address: "11栋A642",
      comment: "!23",
      orderState: "REQUESTING",
      foods: [
        {
          portName: "巴黎贝甜",
          name: "肉夹馍",
          specialChoice: "123",
          price: 1
        }
      ]
    }
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    this.refresh();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    wx.showNavigationBarLoading() //在标题栏中显示加载
    this.refresh();
    //模拟加载
    wx.hideNavigationBarLoading(); //完成停止加载
    wx.stopPullDownRefresh(); //停止下拉刷新
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  acceptOrder: function (e) {
    var id = Number.parseInt(e.target.id);
    var that = this;
    wx.request({
      url: app.globalData.backendUrl + "order/supplier/accept/" + id,
      method: "POST",
      header: {
        'Authorization': 'Bearer ' + app.getSupplierToken(),
        'content-type': 'application/json'
      },
      success: function (res) {
        if (res.statusCode == 200) {
          that.refresh();
        }
      }
    })
  },

  rejectOrder: function (e) {
    var id = Number.parseInt(e.target.id);
    var that = this;
    wx.request({
      url: app.globalData.backendUrl + "order/supplier/reject/" + id,
      method: "POST",
      header: {
        'Authorization': 'Bearer ' + app.getSupplierToken(),
        'content-type': 'application/json'
      },
      success: function (res) {
        if (res.statusCode == 200) {
          that.refresh();
        }
      }
    })
  },

  confirmOrderArrive: function (e) {
    var id = Number.parseInt(e.target.id);
    var that = this;
    wx.request({
      url: app.globalData.backendUrl + "order/supplier/confirmArrive/" + id,
      method: "POST",
      header: {
        'Authorization': 'Bearer ' + app.getSupplierToken(),
        'content-type': 'application/json'
      },
      success: function (res) {
        if (res.statusCode == 200) {
          that.refresh();
        }
      }
    })
  },

  stopReceivingOrder: function () {
    //在后端数据库删除本店食品
    wx.request({
      url: app.globalData.backendUrl + "food/supplier/shelf",
      method: "DELETE",
      header: {
        'Authorization': 'Bearer ' + app.getSupplierToken(),
        'content-type': 'application/json'
      },
      data: {
        supplierFoodIds: wx.getStorageSync("supplierFoodIds")
      },
      success: function (res) {
        if (res.statusCode == 200) {
          wx.showToast({
            title: '下架成功',
            icon: 'success',
            duration: 1000
          });
        } else if (res.statusCode == 404) {
          wx.showToast({
            title: '食品id不存在',
            icon: 'warn',
            duration: 1000
          });
        } else {
          wx.showToast({
            title: '系统繁忙',
            icon: 'warn',
            duration: 1000
          });
        }
      }
    })
  },

  refresh: function () {
    var that = this;
    wx.request({
      url: app.globalData.backendUrl + "order/supplier",
      method: "GET",
      header: {
        'Authorization': 'Bearer ' + app.getSupplierToken(),
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        console.log(res)
        that.setData({
          orders: res.data.orders
        })
      }
    })
  }
})