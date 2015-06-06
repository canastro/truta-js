(function() {
    var importDoc = document.currentScript.ownerDocument; // importee

    // Define and register <shadow-element>
    // that uses Shadow DOM and a template.
    var profilFormProto = Object.create(HTMLElement.prototype);

    profilFormProto.createdCallback = function() {
        // get template in import
        var template = importDoc.querySelector('#template');

        // import template into
        var clone = document.importNode(template.content, true);

        var root = this.createShadowRoot();
        root.appendChild(clone);
    };

    document.registerElement('profile-form', {
        prototype: profilFormProto
    });
})();
