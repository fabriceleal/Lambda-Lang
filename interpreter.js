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

var evalExpr = function(expr, env){
	if(env === undefined)
		env = { bindings:{}, outer:{}};

	if(typeof expr === 'string'){	
		// Strings should evaluate to anything they refer to
		return lookup(expr, env);
	}
	
	if(typeof expr === 'function'){
		return expr;
	}

	if(! expr instanceof Array)
		throw 'Ups! Expr is not an array ...';

	switch(expr[0]){
		case "#":
			// Return a Javascript function object
			return function(argLst){
				var new_env = {
					bindings : {},
					outer: env
				};
				
				expr[1].forEach(function(item, idx){
					addBinding(item, argLst[idx], new_env);
				});

				return evalExpr(expr[2], new_env); 
			};			
	}

	return evalExpr(expr[0], env)(expr[1]);

	throw 'Ups! Looks like the interpreter is missing something :P ... failed with expr = ' + JSON.stringify(expr);
};

