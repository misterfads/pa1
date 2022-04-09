1.
x = print(5)
print(x-4)
In CPython, print() returns a None type, but this doesn't exist for 
our compiler. Instead print(5) will assign 5 to x. This is because
the value used in print is not getting removed from the stack, and
to make our compiler match CPython we would have to do that.

pow = 2
pow(pow, pow)
In our compiler, this evaluates to 4. In CPython, we get
"TypeError: 'int' object is not callable", because it does not recognize
that the first pow used in pow(pow, pow) is the function pow, and not
the variable defined right before. Our compiler doesn't have this
issue because lezer-python parses properly. To make this match with
CPython, maybe we could check in definedVars in compiler.ts if
the builtin function has been defined previously to decided whether
to throw an error?

pow(2,-3)
In our compiler, this evaluates to 0. In CPython this would
evalulate to 1/8. This is because currently our compiler only handles
type i32. We would have to extend our compiler to also use
the type f32 or f64 in web assembly. In runner.ts, "pow" is defined as
returning a type i32, so this would have to get changed as well.

2. The TA tutorial video as well as the readings provided on
the course assignment page. Piazza was also very helpful in terms
of finding answers to some of my questions as well as edge cases
I hadn't thought of.

3. I worked by myself.