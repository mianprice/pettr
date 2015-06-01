/* global define $ console alert document */

var searchZip;
var searchType;
var searchGender;
var searchSize;
var searchAge;
var alertStatus;
var apiQuery;
var lastOffset = 0;
var petArray = [];
var petHistory = [];
var currentPet;
var template;
var height = $(window).height();

function pet(petRecord) {
    this.name = petRecord.name['$t'];
    this.type = petRecord.animal['$t'];
    this.age = petRecord.age['$t'];
    this.gender = petRecord.sex['$t'];
	this.size = petRecord.size['$t'];
	this.description = Handlebars.Utils.escapeExpression(petRecord.description['$t']);
	this.id = petRecord.id['$t'];
	this.breed = petRecord.breeds.breed['$t'];
	for (var i = 0; i < petRecord.media.photos.photo.length; i++) {
		if (petRecord.media.photos.photo[i]['@size'] === "x") {
			this.photo = petRecord.media.photos.photo[i]['$t'];
		}
	}
	if (this.gender === "M") {
		this.genderString = "Male";
	} else {
		this.genderString = "Female";
	}
	if (this.size === "S") {
		this.sizeString = "Small";
	} else if (this.size === "M") {
		this.sizeString = "Medium";
	} else if (this.size === "L") {
		this.sizeString = "Large";
	} else {
		this.sizeString = "Extra Large";
	}
	this.photoString = "<img class='petImage' src='" + this.photo + "'/>";
}

function apiCall() {
	var q = apiQuery;
	if (lastOffset > 0) {
		var o = "&offset=" + lastOffset;
		q += o;
	}
	q += "&callback=?";
	$.getJSON(q)
		.done(function(petApiData) {
			for (var i = 0; i < petApiData.petfinder.pets.pet.length; i++) {
				var np = new pet(petApiData.petfinder.pets.pet[i]);
				petArray.push(np);
			}
			lastOffset = petApiData.petfinder.lastOffset['$t'];
			if ($("#search").css("display") === "block") {
				loadPet();
			}
	})
		.error(function(err) {
			alert('Error retrieving data!');
	});
}

function petSearch() {
	searchZip = $("#zip").val();
	var zipRegex = /^\d{5}$/;
    if (!zipRegex.test(searchZip)) {
		if (!alertStatus) {
		$("#title").append("<div class='col-xs-12 text-center alert alert-danger' id='zipAlert' role='alert'>Enter a valid zip code</div>");
		alertStatus = true;
		}
		$("#searchModal").modal('show');
    } else {
		searchType = $("#animalType").val();
		searchGender = $("#petGender").val();
		searchSize = $("#petSize").val();
		searchAge = $("#petAge").val();
		apiQuery = "http://api.petfinder.com/pet.find?output=full&format=json&count=10&key=7ab675bca71b265d020a2294cbb98ac7&location="+searchZip;
		if (searchType !== "any") {
			var t = "&animal=" + searchType;
			apiQuery += t;
		}
		if (searchGender !== "any") {
			var g = "&sex=" + searchGender;
			apiQuery += g;
		}
		if (searchSize !== "any") {
			var s = "&size=" + searchSize;
			apiQuery += s;
		}
		if (searchAge !== "any") {
			var a = "&age=" + searchAge;
			apiQuery += a;
		}
		petArray = [];
		apiCall();
    }
}

function loadPet() {
	var vh = 0.75*height;
	$("#result").fadeOut(100);
	$("#result").empty();
	var source = $("#petTemplate").html();
	var template = Handlebars.compile(source);
	currentPet = petArray.shift();
	var context = currentPet;
	var html = template(context);
	$("#result").html(html);
	$(".petImage").css({"display":"block", "max-height": vh, "max-width": "100%", "margin-left": "auto", "margin-right": "auto", "margin-top": "auto", "margin-bottom": "auto", "padding-top": "60px"}); 
	$(".petData").css({"padding-bottom": "50px"});
	$("#result").fadeIn(100);
	if (petArray.length < 5) {
		apiCall();
	}
	summaryCheck()
}

Handlebars.registerHelper('each', function(context, options) {
	var t = "";
	for (var i = 0; i < context.length; i++) {
		t += new Handlebars.SafeString('<tr>' + options.fn(context[i]) + '</tr>');
	}
	return t;
});

function summaryCheck() {
	$("#summaryTable").empty();
	var source = $("#summaryTemplate").html();
	var template = Handlebars.compile(source);
	var context = petHistory;
	var html = template(context);
	$("#summaryTable").html(html);
}

function petSave() {
	petHistory.push(currentPet);
	console.log(petHistory);
	loadPet();
}

function petNext() {
	loadPet();
}

$(document).ready(function() {
	$('#searchModal').modal('show')
	$('#summaryModal').modal('hide');
});