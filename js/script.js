console.log(Backbone) 
console.log("sketti time")//<---test to see if js is connected correctly.

//api request url syntax

//https://openapi.etsy.com/v2/listings/active.js?api_key=**KEYHERE**&callback=?

//api key: "4qbvpiz0vok42wn8xewnojn5"

//--------Models----------------//

// extend the native Backbone with our etsy model constructor. this constructor adds a custom api key value, and assigns the api request url to the url attribute.

var EtsyModel = Backbone.Model.extend ({
	defaults: {
		description: "no description provided",
	},
	_apiKey: "4qbvpiz0vok42wn8xewnojn5",
	url: "",
	_generate_URL: function(id) {
		var fullURL = "https://openapi.etsy.com/v2/listings/" + id + ".js"
		this.url = fullURL
	},
	parse: function(JSONData){
		if (JSONData.data) return JSONData.data
		else return JSONData	
	}

})

var EtsyCollection = Backbone.Collection.extend ({
	_apiKey: "4qbvpiz0vok42wn8xewnojn5",
	url: "https://openapi.etsy.com/v2/listings/active.js?",
	model: EtsyModel,
	parse: function(JSONData){
		return JSONData.results
	}
})
//need to add a detail Model here.

//----Views---------------//

//extending the native backbone view with our EtsyHomeView constructor. Assigning our container element to the "el" attribute.

var EtsyHomeView = Backbone.View.extend({

	el: "#container",

	initialize: function(collection) {
	this.collection = collection	
	console.log(this.model)
	var newFunc = this._render.bind(this)
	this.collection.on("sync", newFunc)	
	},
	events: {
		"click img.etsyHome": "_triggerDetailView"
			},

	_triggerDetailView: function(clickEvent) {
		var imageNode = clickEvent.target
		location.hash = "detail/" + imageNode.getAttribute("listingid")
		console.log(clickEvent.target)
	},		
			
	_render: function(){
		var dataArray = this.collection.models	
		var itemUrlString = ""
		console.log(dataArray[0])
	for (var i = 0; i < 12; i++) {
		var itemObj = dataArray[i]
		// console.log(itemObj)
		// console.log(itemObj.Images[0].url_570xN)
		var itemId = itemObj.get('listing_id')
	// console.log(itemObj.listing_id)	
	itemUrlString += '<div class="itemBox"><img class="etsyHome" listingId="' + itemId + '"src="' + itemObj.attributes.Images[0].url_570xN + '">' + '<p>' + itemObj.attributes.description.substr(0, 140) + '...' + '</p></div>'
	}	
		this.el.innerHTML = itemUrlString

	console.log(dataArray)
	//need to add for loop to get each item, and this.el.innterHTML = itemUrlString
	}

})

var EtsyDetailView = Backbone.View.extend ({
	el: "#container",

	initialize: function(someModel) {
		this.model = someModel
		var newFunc = this._render.bind(this)
		this.model.on("sync", newFunc)
	},

_render: function() {

	console.log(this.model.attributes.results[0].Images[0].url_570xN)
	itemUrl = this.model.attributes.results[0]

	this.el.innerHTML = '<div class="itemBox"><img class="etsyDetail" src="' + itemUrl.Images[0].url_570xN + '">' + '<p>' + itemUrl.description + '</p></div>'
}	
})

var EtsyRouter = Backbone.Router.extend ({

	routes: {
		"home/": "handleHomeView",
		"detail/:id": "handleDetailView"
	},

	handleHomeView: function(){
		var colleccion = new EtsyCollection()
		var vew = new EtsyHomeView(colleccion)

		colleccion.fetch({
			contentType: "application/json",
			dataType: "jsonp",
			data:{
				includes:"Images",
				api_key: colleccion._apiKey,
				// callback:"?"
			}
		})
	},
	handleDetailView: function(id){
		var dm = new EtsyModel()
		dm._generate_URL(id)
		var dv = new EtsyDetailView(dm)
		// singleModel.url += id
		dm.fetch({
			contentType: "application/json",
			dataType: "jsonp",
			data:{
				includes:"Images",
				api_key: dm._apiKey
				// callback: "?"
			}
		})

	},
	initialize: function() {
		Backbone.history.start()
	}
})

var rtr = new EtsyRouter()