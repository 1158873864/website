var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imageUrl: "",
    name: "",
    price: 0,
    description: '',
    hasSpecialChoice: false,
    specialChoices: [],
    portName: "",
    supplierId: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {},

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

  checkboxChange: function(e) {
    if (this.data.hasSpecialChoice) {
      this.setData({
        specialChoices: []
      })
    }
    this.setData({
      hasSpecialChoice: !this.data.hasSpecialChoice
    })
  },

  addImage: function() {
    var that = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: function(res) {
        that.setData({
          imageUrl: res.tempFilePaths[0]
        })
      }
    })
  },

  addChoice: function() {
    var specialChoices = this.data.specialChoices;
    var item = {
      index: specialChoices.length + 1,
      value: ""
    }
    specialChoices.push(item);
    this.setData({
      specialChoices: specialChoices
    })
  },

  abstractChoice: function() {
    var specialChoices = this.data.specialChoices;
    specialChoices.pop();
    this.setData({
      specialChoices: specialChoices
    })
  },

  /**
   * 确定添加
   */
  confirmAdd: function() {
    if (this.dataCheck()) {
      var that = this;
      var supplierUsername = wx.getStorageSync("supplierUsername");
      var choices = [];
      for (var i = 0; i < this.data.specialChoices.length; i++) {
        choices.push(this.data.specialChoices[i].value);
      }
      wx.request({
        url: app.globalData.backendUrl + "food/supplier",
        method: "PUT",
        header: {
          'Authorization': 'Bearer ' + app.getSupplierToken(),
          'content-type': 'application/json'
        },
        data: {
          name: that.data.name,
          url: that.data.imageUrl,
          description: that.data.description,
          price: that.data.price,
          hasChoice: that.data.hasSpecialChoice,
          choice: choices,
          portName: that.data.portName
        },
        success: function(res) {
          if (res.statusCode == 404) {
            wx.showToast({
              title: '档口不存在',
              icon: 'warn',
              duration: 1000
            });
          } else if (res.statusCode == 201) {
            wx.uploadFile({
              url: app.globalData.backendUrl + "upload/food/" + res.data.foodId,
              header: {
                'Authorization': 'Bearer ' + app.getSupplierToken()
              },
              filePath: that.data.imageUrl,
              name: 'file',
              success: function(res) {
                wx.showToast({
                  title: '上传成功',
                  icon: 'success',
                  duration: 1000
                });
                wx.navigateTo({
                  url: "../addFood/addFood",
                })
              }
            })
          }
        }
      })
    }
  },

  onPortNameInput: function(e) {
    this.setData({
      portName: e.detail.value
    })
  },

  onFoodNameInput: function(e) {
    this.setData({
      name: e.detail.value
    })
  },

  onFoodPriceInput: function(e) {
    this.setData({
      price: e.detail.value
    })
  },

  onSpecialChoiceInput: function(e) {
    var specialChoices = this.data.specialChoices;
    specialChoices[e.target.id - 1].value = e.detail.value;
    this.setData({
      specialChoices: specialChoices
    })
  },

  onFoodDescriptionInput: function(e) {
    this.setData({
      description: e.detail.value
    })
  },

  backToManageFood: function() {
    wx.navigateTo({
      url: "../manageFood/manageFood",
    })
  },

  dataCheck: function(e) {
    if (this.data.portName.length == 0) {
      wx.showModal({
        title: '信息不完整',
        content: '请填写档口名称',
      })
      return false;
    } else if (this.data.name.length == 0) {
      wx.showModal({
        title: '信息不完整',
        content: '请填写菜品名称',
      })
      return false;
    } else if (this.data.price == 0) {
      wx.showModal({
        title: '信息不完整',
        content: '请填写单价',
      })
      return false;
    }
    return true;
  }
})