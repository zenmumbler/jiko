module "Jiko" {

	module Util from "Util";
	export {Util};

}

module Jiko from "Jiko";

function main() {
	Jiko.Util.log("aap", "noot", 1);
	alert("hm");
}
