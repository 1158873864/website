var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    ports: [],

    dialogIsHiden: true,
    portName: ""
  },

  bindPortNameInput: function(e) {
    this.setData({
      portName: e.detail.value
    })
  },

  closeDialog: function() {
    this.setData({
      dialogIsHiden: true
    })
  },

  confirmAddDialog: function() {
    var that = this;
    wx.request({
      url: app.globalData.backendUrl + "food/supplier/port",
      header: {
        'Authorization': 'Bearer ' + app.getSupplierToken(),
        'content-type': 'application/json'
      },
      data: {
        portName: this.data.portName
      },
      method: 'PUT',
      success: (res) => {
        if (res.statusCode == 201) {
          wx.showToast({
            title: "添加成功",
          })
          that.setData({
            dialogIsHiden: true
          })
          that.onLoad();
        }
      }
    })
  },

  deletePort: function(e) {
    var that=this;
    var id = e.target.id;
    wx.request({
      url: app.globalData.backendUrl + "food/supplier/port/" + id,
      header: {
        'Authorization': 'Bearer ' + app.getSupplierToken(),
        'content-type': 'application/x-www-form-urlencoded'
      },
      method: 'DELETE',
      success: (res) => {
        if (res.statusCode == 200) {
          that.onLoad();
        }
      }
    })
  },

  addPort: function() {
    this.setData({
      dialogIsHiden: false
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;
    wx.request({
      url: app.globalData.backendUrl + "food/supplier/port",
      header: {
        'Authorization': 'Bearer ' + app.getSupplierToken(),
        'content-type': 'application/x-www-form-urlencoded'
      },
      method: 'GET',
      success: (res) => {
        if (res.statusCode == 200) {
          that.setData({
            ports: res.data.simplePortItemList
          })
        }
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

  }
})