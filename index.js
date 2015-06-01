import {$} from "./lib/dom";
import {Store} from "./lib/store";
import {Component} from "./lib/component";

$(".addClass").addClass("passed");
$(".removeClass").removeClass("failed");

if ($(".hasClass").hasClass("hasClass")) {
    $(".hasClass").addClass("passed");
}

$("a").on("click", function (e) {
    e.preventDefault();
    alert("cliked");
});

var data = {
    name: 'teste'
};
var component = new Component({
    host: '#nameTag', 
    template: '#nameTagTemplate', 
    scope: data
});

var store = new Store();

window.setTimeout(function () {
    store.get(1).value.name = 'coisas';
}, 1000);
