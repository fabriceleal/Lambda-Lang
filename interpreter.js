var lookup = function(v, env){

	if(env === undefined)
		throw 'Couldnt find ' + v + ' in env!';

	if(env.bindings && env.bindings.hasOwnProperty(v))
		return env.bindings[v];

	return lookup(v, env.outer)
};


var addBinding = function(name, value, env){
	env.bindings[name] = value;
};

var deepEqual = function(a, b){
	if(typeof a !== typeof b)
		return false;

	if(typeof a === 'object'){		
		if(a.constructor == Array){
			// Array
			if(a.length != b.length)
				return false;

			for(var i in a){
				if(!deepEqual(a[i], b[i])){
					return false;		
				}
			}
			
			return true;
		}else{
			// Dictionary
			// 1) Get array of keys for each dictionary
			var keys_a = [], keys_b = [];

			for(var ka in a){ keys_a.push(ka); }
			for(var kb in b){ keys_b.push(kb); }

			if(keys_a.length != keys_b.length){
				return false;
			}
			
			// 2) Compare the sorted keys, to check if both dictionaries have the same keys
			keys_a = keys_a.sort(function(a, b){ return a > b;});
			keys_b = keys_b.sort(function(a, b){ return a > b;});
			
			if(! deepEqual(keys_a, keys_b)){
				return false;
			}

			// 3) Compare values through  the dictionary
			for(var i in keys_a){
				if(! deepEqual(keys_a[i], keys_b[i])){
					return false;
				}
			}
			
			// 4) If you reach this point, you have deepEqual !
			return true;
		}
	}
	
	return a === b;	
};

/**
 * Normal eval.
 */
var evalExpr = function(expr, env){
	if(env === undefined)
		env = { bindings:{}, outer:{}};

	if(typeof expr === 'string'){	
		// Strings should evaluate to anything they refer to
		try{
			return lookup(expr, env);
		}catch(e){
			return expr;
		}		
	}
	
	if(typeof expr === 'function'){
		return expr;
	}

	if(! expr instanceof Array)
		throw 'Ups! Expr is not an array ...';

	// Lambda
	switch(expr[0]){
		case "#":
			// Return the expr itself. Expr should only be "compiled" into a function in an application
			return [expr[0], expr[1], evalExpr(expr[2], env)];
	}

	// *Try* to reduce the body ;)

	// Application, if possible
	var funIsIt = evalExprForce(expr[0], env);

	if(typeof funIsIt === 'function'){
		return funIsIt(expr[1]);
	}else{
		// Recursive, until there is no more simplification
		var evaled = [funIsIt, evalExpr(expr[1], env)]
		
		if(deepEqual(evaled, expr)){
			return evaled;
		}else{
			return evalExpr(evaled);
		}
	}

	throw 'Ups! Looks like the interpreter is missing something :P ... failed with expr = ' + JSON.stringify(expr);
};


/**
 * If it finds a lambda, forces compilation. Otherwise, normal eval.
 */
var evalExprForce = function(expr, env){
	if(env === undefined)
		env = { bindings:{}, outer:{}};

	if(! expr instanceof Array)
		return evalExpr(expr, env);
	
	switch(expr[0]){
		case "#":
			// Return a Javascript function object
			return function(arg){
				var new_env = {
					bindings : {},
					outer: env
				};
				
				addBinding(expr[1], arg, new_env);		

				//console.log(new_env);		

				return evalExpr(expr[2], new_env); 
			};	
	}
	
	return evalExpr(expr, env);
};

