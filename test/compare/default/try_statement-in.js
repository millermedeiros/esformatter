try{foo()}   catch (e){  log(e)
}

try
{
// foo comment
        foo();
}
finally
{
                // bar comment
            bar();
            }

try{foo()}   catch (e){  log(e)
                      } finally {
                        bar()
         }
