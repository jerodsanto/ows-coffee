require "./app"

use Rack::SSL
run Sinatra::Application
