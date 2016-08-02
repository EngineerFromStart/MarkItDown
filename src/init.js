var basic = {
    plugins: 'link image preview save paste'
}
var github = {
    plugins: 'tables strikethrough'
}
var bitbucket = {
    plugins: 'tables'
}
var my_textarea;
var md_textarea;

var showdown = new showdown.Converter();

tinymce.init({
    selector: '#mytextarea',
    plugins: [basic.plugins],
    width: '50%',
    height: 500,
    toolbar: 'cut copy paste undo redo | styleselect | bold italic | bullist numlist | blockquote | link image',
    style_formats: [{
        title: "Paragraph",
        block: 'p'
    }, {
        title: "Heading 1",
        block: 'h1'
    }, {
        title: "Heading 2",
        block: 'h2'
    }, {
        title: "Heading 3",
        block: 'h3'
    }, {
        title: "Heading 4",
        block: 'h4'
    }, {
        title: "Heading 5",
        block: 'h5'
    }, {
        title: "Heading 6",
        block: 'h6'
    }, ],
    menu: {
        file: {
            title: "File",
            items: "save, preview"
        },
        edit: {
            title: "Edit",
            items: "cut"
        }
    },
    setup: function(editor) {
        editor.on('change keyup', function(e) {
            if (!md_textarea) {
                md_textarea = tinymce.get("mdtextarea");
            }
            md_textarea.setContent(toMarkdown(editor.getContent()));
        })
    }
});

tinymce.init({
    selector: '#mdtextarea',
    plugins: [basic.plugins],
    width: '50%',
    height: 500,
    toolbar: 'cut copy paste undo redo | myformats | mybold myitalic | my_bullist my_numlist | blockquote | link image',
    menubar: false,
    setup: function(editor) {
        var headings = [];
        var headingStr = ["#"];
        for (x = 1; x < 6; x++) {
            headingStr.push(headingStr[x - 1].concat("#"))
        }
        console.log(headingStr);
        for (x = 0; x < 6; x++) {
            var hash = headingStr[x];
            headings.push({
                text: 'Heading ' + (x + 1),
                hash: hash,
                onClick: function() {
                    var node = editor.selection.getNode();
                    node.innerHTML = this.settings.hash + " " + node.innerHTML;
                }
            })
        }
        editor.addButton('myformats', {
            type: 'menubutton',
            text: 'Formats',
            icon: false,
            menu: headings
        })

        editor.addButton('mybold', {
            text: '',
            icon: 'mce-ico mce-i-bold',
            onClick: function() {
                var text = editor.selection.getContent({
                    format: 'text'
                });
                editor.selection.setContent("**" + text + "**");
            }
        })

        editor.addButton('myitalic', {
            text: '',
            icon: 'mce-ico mce-i-italic',
            onClick: function() {
                var text = editor.selection.getContent({
                    format: 'text'
                });
                editor.selection.setContent("__" + text + "__");
            }
        })

        editor.addButton('my_bullist', {
            text: '',
            icon: 'mce-ico mce-i-bullist',
            onClick: function() {
                var node = editor.selection.getNode();
                node.innerHTML = "* " + node.innerHTML;
                editor.selection.select(node, true);
                editor.selection.collapse(false);
                node.MarkItDownContext = "bullist";
            }
        })
        editor.addButton('my_numlist', {
            text: '',
            icon: 'mce-ico mce-i-numlist',
            onClick: function() {
                initNumList(editor);
            }
        })

        editor.on('change keydown', function(e) {
            if (!my_textarea) {
                my_textarea = tinymce.get("mytextarea");
            }
            my_textarea.setContent(showdown.makeHtml(editor.getContent({
                format: 'text'
            })));
        })
    }
});

function initNumList(editor) {
    var lastNum = 0;
    var node = editor.selection.getNode();
    var prevNode = tinymce.DOM.getPrev(node, "p");
    var prevNodeText = prevNode.innerHTML;
    var matcher = new RegExp("^(\\d+)\\.\\s+.*"); //double slashes since it converts string into obj
    if (matcher.test(prevNodeText)) {
        var digits = matcher.exec(prevNodeText);
        lastNum = parseInt(digits[1]);
    }
    node.innerHTML = (lastNum + 1) + ". " + node.innerHTML;
    editor.selection.select(node, true);
    editor.selection.collapse(false);
    node.MarkItDownContext = "numlist";

    node.parentElement.onkeydown = function(e) {
        var key = e.keyCode ? e.keyCode : e.which;

        if (tinyMCE.activeEditor && key == 13) {
            var newNode = editor.selection.getNode();
            var prevNode = tinymce.DOM.getPrev(newNode, "p");
            if (prevNode.MarkItDownContext) {
                if (prevNode.MarkItDownContext == "numlist") {
                    initNumList(editor);
                }else if (prevNode.MarkItDownContext == "bullist") {
                    initNumList(editor);
                }
            }
        }
    }
}
