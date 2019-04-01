var Bloom = function (settings) {
    this.pituus = settings.pituus || 100;
    this.bitsPerUnit = settings.bitsPerUnit || 4;
    this.funs = [];
    this.bloomData = new BloomData(settings.pituus, this.bitsPerUnit);

    this.addFun = function (fun) {
        this.funs.push(fun);
    }

    this.add = function (strn) {
        this.bloomData.insertNew(strn);
    }

    this.check = function (strn) {
        return this.bloomData.checkStrn(strn);
    }

    this.printData = function () {
        // Something
    }

    this.getHeatmap = function () {
        return this.bloomData.getData();
    }

    this.getColMap = function () {
        return this.bloomData.getCol();
    }

    this.getPituus = function () {
        return this.pituus;
    }

    this.getDataObj = function () {
        return this.bloomData;
    }

    this.getTotal = function () {
        return this.bloomData.getTotalBits();
    }

    this.countEmpty = function () {
        return this.bloomData.countEmpty();
    }
}


var BloomData = function (pituus, bitsPerUnit) {

    this.data = [];
    this.pituus = pituus;
    this.bitsPerUnit = bitsPerUnit
    this.totalBits = 0;

    this.colZone = [];


    this.init = function () {

        for (var i = this.pituus - 1; i >= 0; i--) {

            this.data.push(0);
            this.colZone.push(0);
        };

    }


    this.addEl = function (offset_arr) {

        var collisions = 0;

        for (var i = offset_arr.length - 1; i >= 0; i--) {

            this.colZone[offset_arr[i]]++;
            this.data[offset_arr[i]] = 1;

        };



    }

    this.checkEl = function (offset_arr) {

        var acc = 0;

        for (var i = offset_arr.length - 1; i >= 0; i--) {

            !this.data[offset_arr[i]] || acc++;

        };

        return acc === this.bitsPerUnit ? true : false;

    }

    this.insertNew = function (strn) {



        var bloomFn = new BloomFunction(strn, this.bitsPerUnit, this.pituus);

        this.addEl(bloomFn.doHash());

        this.totalBits += this.bitsPerUnit;



    }

    this.checkStrn = function (strn) {

        var bloomFn = new BloomFunction(strn, this.bitsPerUnit, this.pituus);

        return this.checkEl(bloomFn.doHash());

    }

    this.getData = function () {

        return this.data;
    }


    this.getCol = function () {

        return this.colZone;
    }

    this.getTotalBits = function () {

        return this.totalBits;
    }

    this.countEmpty = function () {

        var acc = 0;

        for (var i = this.pituus - 1; i >= 0; i--) {

            this.data[i] || acc++;
        };

        return acc;

    }

    this.init();






}


var BloomFunction = function (strn, bitsPerUnit, pituus) {

    this.bitsPerUnit = bitsPerUnit;
    this.pituus = pituus;
    this.strn = strn;

    this.finalSums;

    this.doHash = function () {



        this.hashFunction();
        return this.takeModulos();


    }

    this.takeModulos = function () {

        var that = this;

        return this.finalSums.map(function (num) {

            return num % that.pituus;

        });






    }

    this.createSumArr = function () {

        var arr = [];

        for (var i = 0, j = this.bitsPerUnit; i < j; i++) {

            arr[i] = 0;
        };

        return arr;



    }

    this.hashFunction = function () {

        var chars = this.strn.split("");



        var finalSums = this.createSumArr();

        for (var i = chars.length - 1; i >= 0; i--) {



            for (var j = 0; j < this.bitsPerUnit; j++) {

                var power = 3 * (j + 1);

                finalSums[j] += chars[i].charCodeAt(0) * Math.pow(3, power) + j;
            };

        };



        this.finalSums = finalSums;
    }




}

var BloomTestSuite = function (Bloom, graphHolder) {

    // Private. Should be kept constant.

    var CHARS = "abcdefghijklmnopqrstuwvxyzABCDEFGHIJKLMOPQRSTUWVXYZ ";

    // Public stuff

    this.Bloom = Bloom;
    this.graphHolder = graphHolder;
    this.addedStrings = [];

    this.addOne = function (strn) {

        this.Bloom.add(strn);
        this.graph(this.checkCols());


    }


    this.launch = function (numOfStrings) {

        this.pushStrings(numOfStrings);
        this.graph(this.checkCols());
        console.log(this.checkSpread());
        console.log(this.emptyRatio());




    }

    this.check = function (string) {

        return this.Bloom.check(string);


    }

    this.falsePositiveRate = function (numOfTries) {

        var positives = 0;

        for (var i = numOfTries - 1; i >= 0; i--) {

            var string = this.randomString();

            var was = this.Bloom.check(string);

            if (was && this.addedStrings.indexOf(string) === -1) {

                positives += 1;
            }


        };

        return Math.round((positives / numOfTries) * 100) / 100;


    }

    this.emptyRatio = function () {

        return Math.round((this.Bloom.countEmpty() / this.Bloom.getPituus()) * 100) / 100;
    }

    this.pushStrings = function (num) {

        for (var i = num - 1; i >= 0; i--) {

            var string = this.randomString();

            this.addedStrings.push(string);

            this.Bloom.add(string);

        };
    }

    this.randomString = function () {

        // Length is randomly taken from numbers 3 to 16

        var length = Math.floor(3 + (Math.random() * 14));
        var string = "";
        var index;
        var charsNum = CHARS.length;

        for (var i = length - 1; i >= 0; i--) {

            index = Math.floor(Math.random() * (charsNum + 1));

            string += CHARS.charAt(index);



        };

        return string;
    }

    this.checkCols = function () {

        return this.Bloom.getColMap();


    }

    this.checkSpread = function () {

        var data = this.Bloom.getColMap();
        var total = this.Bloom.getTotal();

        return this.calcStd(data, total);


    }

    this.calcStd = function (data, total) {

        var deviation_sum = 0;
        var avg = total / this.Bloom.getPituus();

        for (var i = data.length - 1; i >= 0; i--) {

            deviation_sum += Math.pow(data[i] - avg, 2);
        };



        return Math.sqrt(deviation_sum / total);


    }

    this.graph = function (data) {

        // Taking off from element flow
        console.log("Graph holder");
        console.log(this.graphHolder);
        var heater = document.getElementById('heatmapBloom');

        if (heater) {

            console.log("UL");
            console.log(heater);

            heater.parentNode.removeChild(heater);
        }



        var ul = document.createElement('ul');
        ul.id = "heatmapBloom";

        var frag = document.createDocumentFragment();

        for (var i = 0, j = data.length; i < j; i++) {

            var val = data[i];

            var box = document.createElement('li');
            box.textContent = val;

            if (val > 9) {

                val = 9;
            }

            box.className = "box heat_" + val;
            frag.appendChild(box);


        };

        ul.appendChild(frag);

        this.graphHolder.appendChild(ul);




    }

    // Initialize new empty graph right when creating this object!

    this.graph(this.checkCols());
}