var today = (new Date()).toLocaleDateString().replace(/\//g, '_');//今天日期
module.exports = {
    // shopName: ['nike'], //需要截图的店铺名称
    shopName: ["adidas","adidasfootball","reebok","nike","underarmour","converse","newbalance","anta","vans","skechersyd","lululemon","uniqlo","zara","puma","xtep","jordan","fila","nbastore","lining","adidaskids","nikekids","newbalancekids","goodbaby","skecherstx","liningkidstz","antakids","pumatz","xteptz","filatz","vanskids","nbatz","decathlon","361du","xingyunyeziguanfang","asics","davebella","balabala","gap"], //需要截图的店铺名称
    analyzerFolderName: '_analyzer', //模块分析截图名称后缀
    screenFolder: `./screenshot/${today}/`, //截图目录
    screenWidth: 750, //截图宽度
    picHeight: 500, //每屏缓存高度
}