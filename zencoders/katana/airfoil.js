define(["dojo/_base/declare","dijit/_WidgetBase", "dojo/_base/lang"],
    function(declare, WidgetBase, lang){
        // summary:
        //     An airfoil.
        // description:
        //     It encapsulate an airfoil rapresentation with all attributes
        //     and methods to calculate properties.
        // returns:
        //     None.
        return declare([WidgetBase], {
        
            // norm: Object
            //     This object is in the form {x:width,y:height}. The contained
            //     values will be used as normalize factors for the point's
            //     coordinates. 
            norm : {x:500,y:500},
            
            // step: float
            //     During the generation of the points for the naca profiles 
            //     the number of points is given by 1/step and in some cases
            //     step is the distance between two near points.
            step : 0.1,    //distance between generated x values
            
            // xDitribution: int
            //     Distribution selector:
            //     "1" Linear
            //     "2" Half Cosine Points
            xDistribution : 1,
            
            // m: int
            //     maximum camber as percentage of the chord 
            m : 2,
            
            // p: int
            //     distance of maximum camber from the airfoil... 
            //     leading edge in tens of percent's of the chord
            p : 4,      
            
            // t: int
            //     maximum thickness as a fraction of the chord
            t : 15,
            
            // c: int
            //     chord length
            c : 1,      
            
            setCamber:function(m){
                // summary:
                //     Sets the camber
                // description:
                // returns: Nothing
                if(m<0 || m>100){
                    throw ("Error value for Camber")
                }else{
                    this.m=m;
                }
            },
            
            getNACACode:function(){
                // summary:
                //     get the NACA 4 digit code if current foil is a naca one.
                // description:
                // returns: Nothing
                return ""+this.m+this.p+this.t; // String
            },
            
            setDistance:function(p){
                if(p<0 || p>100){
                    throw ("Error value for Camber Distance")
                }else{
                    this.p=p;
                }
            },
            
            setThickness:function(t){
                if(t<0 || t>100){
                    throw ("Error value for thickness")
                }else{
                    this.t=t;
                }
            },
            
            theta: function(x){
                var p=this.p/10;
                var m=this.m/100;
                var c=this.c;
                var alpha=0;
                if (x>=0 && x<=p){
                    //console.log("theta",x," x>=0 && x<=p")
                    alpha= 2*m/p*(1-(x/(c*p))) //2*m*(p-x)/Math.pow(p,2);
                }
                else if(x>p && x<=1){
                    //console.log("theta",x," x>p && x<=1")
                    alpha=2*m/(1-(p*p))*(x+p)  //2*m*(p-x)/Math.pow((1-p),2);
                }
                //console.log("theta=",Math.atan(alpha))
                return Math.atan(alpha);
            },
            
            _getXDistribution : function(dist){
                switch (dist){
                    case 0 : return this.xLinearPoints();break;
                    case 1 : return this.xHalfCosinePoints();break;
                    default : throw("An unavailable distribution was chosen.");
                }
            },
            
            yc: function(x){
                var p=this.p/10;
                var m=this.m/100;
                var c=this.c;
                if(x>=0 && x<=p){
                    //console.log("yc",x," x>=0 && x<=p")
                    return (m*(x/(p*p)))*(2*p-(x/c))
                    //return m/Math.pow(x,2)*(2*p*x-Math.pow(x,2))
                }
                else if(x>p && x<=c){
                    //console.log("yc",x," x>p && x<=1")
                    return (m*((c-x)/(Math.pow((1-p),2))))*((1+(x/c)-2*p))
                    //return m/((1-p)*(1-p))*((1-2*p)+2*p*x-x*x)
                }
            },
            
            yt: function(x){
                var t=this.t/100;
                var c=this.c;
                return (t/0.2)*c*(0.2969*Math.sqrt(x/c)-0.1260*x-0.3516*Math.pow(x/c,2)+0.2843*Math.pow(x/c,3)-0.1015*Math.pow(x/c,4));
            },
            
            normalize: function(points){
                if (this.norm!=null){
                    var nPoints=[points.length]; //normalized points
                    for(var i=0;i<points.length;i++){
                        nPoints[i]=points[i];
                        nPoints[i]['x']=points[i]['x']*this.norm['x'];
                        nPoints[i]['y']=points[i]['y']*this.norm['y'];
                    }
                    return nPoints;
                }
                return points;
            },
            
            xLinearPoints : function (){
                if (typeof(step)=='undefined')
                    step=this.step;
                points=[1/step];
                for(var x=j=0;x<=1;x+=step,j++){
                    points[j]=x;
                }
                return points;
            },
            xHalfCosinePoints : function (){
                if (typeof(step)=='undefined')
                    step=this.step;
                points=[Math.PI/step];
                for(var x=j=0;x<=Math.PI;x+=step,j++){
                    points[j]=0.5*(1-Math.cos(x));
                }
                return points;
            },
            
            upperSurfPoints : function(){
                //x values are retrieved by the distribution selected by 
                //the xDistribution parameter.
                var x=this._getXDistribution(this.xDistribution);
                var points=[x.length];
                for (var i=0;i<x.length;i++){
                    points[i]={
                        x:x[i]-this.yt(x[i])*Math.sin(this.theta(x[i])),
                        y:this.yc(x[i])+this.yt(x[i])*Math.cos(this.theta(x[i])),
                    }
                }
                return this.normalize(points);
            },
            
            lowerSurfPoints : function(){
                x=this._getXDistribution(this.xDistribution);
                var points=[x.length];
                for (var i=0;i<x.length;i++){
                    points[i]={
                        x:x[i]+this.yt(x[i])*Math.sin(this.theta(x[i])),
                        y:this.yc(x[i])-this.yt(x[i])*Math.cos(this.theta(x[i])),
                    }
                }
                return this.normalize(points);
            },
            
            camberLinePoints : function(step){
                x=this._getXDistribution(this.xDistribution);
                var points=[x.length];
                for (var i=0;i<x.length;i++){
                    points[i]={x:x[i],y:this.yc(x[i])}
                }
                return this.normalize(points);
            },
		});
    });
