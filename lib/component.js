import {Data} from "./data";
import {Store} from "./store";
import {$} from "./dom";


export class Component {
    
    constructor(params) {
        
        var shadow;
        var template;
        var clone;
        var data;
        var store;
        var contents;
        var model;
        
        this.template = params.template;
        this.host = document.querySelector(params.host);
//        this.host.textContent = params.scope.name;

        shadow = this.host.createShadowRoot();
        template = document.querySelector(params.template);
        clone = document.importNode(template.content, true);

        data = new Data(1, params.scope);
        store = new Store();

        this.contentA =  document.querySelector(params.host + ' .name');
        this.contentA.textContent = data.value.name;
        
        shadow.appendChild(clone);
        
        Object.observe(data.value, function () {
            this.contentA.textContent = data.value.name;
        }.bind(this));
        
        contents = shadow.querySelectorAll('content');
        if(contents && contents.length) {
            for (let el of Array.from(contents)) {
                
            }
        }
        
//        Object.keys(data.value).forEach(function(item) {
//            
//            if(typeof(data.value[item]) === 'object') {
//                Object.observe(item, function () {
//                    this.host.textContent = data.value.name;
//                }.bind(this));
//            }
//        }.bind(this));

//        inputs = shadow.querySelectorAll('input');
//        if(inputs && inputs.length) { 
//            for (let el of Array.from(inputs)) {
//                model = el.getAttribute('es-model');
//                
//                
//            }
//        }
    }
    
    
}