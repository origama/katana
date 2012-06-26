define(["dojo/_base/declare","dijit/_WidgetBase", "dojo/_base/lang","zencoders/katana/airfoil"],
    function(declare, WidgetBase, lang, airfoil){
        return declare([WidgetBase], {
            name: "No Name",
			//avatar: require.toUrl("zencoders.katana", "images/katana.png"),
			bio: "",
			airfoil:new airfoil(),
            baseClass: "katana",
            mouseAnim: null,
            baseBackgroundColor: "#fff",
			mouseBackgroundColor: "#def",

			postCreate: function(){
				var domNode = this.domNode;
				this.inherited(arguments);
				
			},
			
		});
    });
