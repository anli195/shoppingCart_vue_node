// Created by anli on 2017/7/26.
var vm = new Vue({
    el: "#app",
    data: {
        //数据
        productList   : [],
        delFlag       : false,
        currentIndex  : "",
        subTotals     : 0,
        cancelCheck   : false,
        checkAll      : false,
        judgeCkeckNum : false,
        inputValue    : ""
    },
    filters: {
        //过滤器
        formatMoney: function (value) {
            return "¥ " + value.toFixed(2) + " 元";
        }
    },
    mounted: function () {
        this.$nextTick(function () {
            //初始时调用方法
            this.cartView();
        })
    },
    watch: {
	    'inputValue': function(newVal, oldVal) {
			console.log(newVal)
	    },
	    'item.productQuantity': function(newVal, oldVal) {
			console.log(newVal)
	    },
	},
    methods: {
        //TODO 方法
        cartView : function () {
            //请求数据
            var _this = this;
            this.$http.get("data/cartData.json",{"id":"1111"}).then(function (res) {
                _this.productList = res.body.result.list;
            })
            var req_truckstatus_url = '/shoppingcart/apii';
            this.$http.get(req_truckstatus_url).then(function (res) {
                console.log(res.body.result.list);
            })
        },
        changeMoney : function (item , way , index) {
            //改变数量
            if(way > 0){
                item.productQuantity ++;
            }else{
                item.productQuantity --;
                if(item.productQuantity < 1){
                    this.delConfirm(index);
                    item.productQuantity = 1;
                }
            };
            this.inputValue = item.productQuantity;
            this.itemTotal();
        },
        selectedProduct: function (item) {
            //是否选中
            if(typeof item.checked == "undefined"){
                // Vue.set(item, "checked", true);
                this.$set(item, "checked", true);
            }else{
                item.checked = !item.checked;
            }
            this.judgeChecked();
            // var checkedNumber = 0;
            // this.productList.forEach(function (value,index) {
            //     if(value.checked){
            //         checkedNumber ++;
            //     }
            // });
            // if(checkedNumber == this.productList.length){
            //     this.checkedAll(true);
            // }else{
            //     this.itemTotal();
            //     this.cancelCheck = false;
            //     this.checkAll = false;
            // };
        },
        checkedAll: function (flag) {
            //是否全选
            this.checkAll = flag;
            var _this = this;
            this.productList.forEach(function (item, index) {
                _this.cancelCheck = flag;
                if (typeof item.checked == 'undefined') {
                    _this.$set(item, "checked", _this.checkAll);
                }else {
                    item.checked = _this.checkAll;
                }
            });
            this.itemTotal();
        },
        itemTotal: function () {
            //合计
            var _this = this;
            this.subTotals = 0;
            this.productList.forEach(function (item,index) {
                if(item.checked){
                    _this.subTotals += item.productPrice * item.productQuantity;
                }
            })
        },
        delConfirm : function (index) {
            //删除对话框弹出
            this.delFlag       = true;
            this.currentIndex  = index;
            this.judgeCkeckNum = false;
        },
        delProduct : function () {
            //删除操作
            this.productList.splice(this.currentIndex, 1);
            this.delFlag = false;
            this.judgeChecked();
        },
        judgeChecked: function () {
            //判断是否全选与非全选
            var checkedNumber = 0;
            this.productList.forEach(function (value,index) {
                if(value.checked){
                    checkedNumber ++;
                }
            });
            if(checkedNumber != 0 && checkedNumber == this.productList.length){
                this.checkedAll(true);
            }else{
                this.itemTotal();
                this.cancelCheck = false;
                this.checkAll = false;
            };
        },
        corderCeckout : function () {
            //结账
            var corderCeckoutFlag = true;
            this.productList.forEach(function (value,index) {
                if(value.checked){
                    corderCeckoutFlag = false;
                }
            });
            if(corderCeckoutFlag){
                this.delFlag = true;
                this.judgeCkeckNum = true;
            }else{

            }
        }
    }
});
//vm.$watch("productList",function(val,oldval){  
//      console.log(val)  
//  })
// 全局过滤器
//用这样的方法进行调用 {{totalMoney | money('元')}}
// Vue.filter('money', function(value, type) {
//     return "¥" + value.toFixed(2) + type;
// })