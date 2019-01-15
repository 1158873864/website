var app = getApp();
Page({
  data: {
    orders: [],

    orderId: 49,
    dialogIsHiden: true,
    foodList: [],
    comment: ""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;
    //从数据库获得所有订单
    wx.request({
      url: app.globalData.backendUrl + "order",
      method: "GET",
      header: {
        'Authorization': 'Bearer ' + app.getToken(),
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function(res) {
        that.setData({
          orders: res.data.orders
        });
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },

  confirmOrder: function(e) {
    var id = e.target.id;
    var that = this;
    wx.request({
      url: app.globalData.backendUrl + "order/" + id,
      method: "POST",
      header: {
        'Authorization': 'Bearer ' + app.getToken(),
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function(res) {
        if (res.statusCode == 200) {
          that.onLoad();
        }
      }
    })
  },

  deleteOrder: function(e) {
    var id = e.target.id;
    var that = this;
    wx.request({
      url: app.globalData.backendUrl + "order/" + id,
      method: "DELETE",
      header: {
        'Authorization': 'Bearer ' + app.getToken(),
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function(res) {
        if (res.statusCode == 200) {
          that.onLoad();
        }
      }
    })
  },

  payOrder: function(e) {
    var id = e.target.id;
    var that = this;
    wx.request({
      url: app.globalData.backendUrl + "order/pay/" + id,
      method: "GET",
      header: {
        'Authorization': 'Bearer ' + app.getToken(),
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function(res) {
        if (res.statusCode == 200) {

        } else {
          wx.showToast({
            title: "订单不存在,请重试",
          })
        }
      }
    })
  },

  onCommentInput: function(e) {
    this.setData({
      comment: e.detail.value
    })
  },

  clickDialog: function(e) {
    var foodList = this.data.foodList;
    for (var i = 0; i < foodList.length; i++) {
      if (foodList[i].id == e.target.id) {
        foodList[i].selected = !foodList[i].selected;
        break;
      }
    }
    this.setData({
      foodList: foodList
    })
  },

  comment: function(e) {
    var foodList = [];
    var orders = this.data.orders;
    for (var i = 0; i < orders.length; i++) {
      if (orders[i].id == e.target.id) {
        var foods = orders[i].foods;
        for (var j = 0; j < foods.length; j++) {
          foodList.push({
            id: foods[i].id,
            selected: false,
            value: foods[i].portName + "-" + foods[i].name
          })
        }
      }
    }
    this.setData({
      orderId: e.target.id,
      foodList: foodList,
    })
    this.setData({
      dialogIsHiden: false
    })
  },

  closeDialog: function() {
    this.setData({
      dialogIsHiden: true
    })
  },

  confirmDialog: function() {
    var that = this;

    var foodIds = [];
    for (var i = 0; i < this.data.foodList.length; i++) {
      if (this.data.foodList[i].selected) {
        foodIds.push(this.data.foodList[i].id);
      }
    }
    wx.request({
      url: app.globalData.backendUrl + "order/comment",
      method: "POST",
      header: {
        'Authorization': 'Bearer ' + app.getToken(),
        'content-type': 'application/json'
      },
      data: {
        orderId: that.data.orderId,
        foodIds: foodIds,
        comment: that.data.comment
      },
      success: function(res) {
        that.closeDialog();
        that.onLoad();
      }
    })
  }
})