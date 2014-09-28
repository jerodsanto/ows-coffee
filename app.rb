require "rubygems"
require "bundler"

Bundler.require

set :stripe_key, ENV["STRIPE_KEY"]
set :stripe_secret, ENV["STRIPE_SECRET"]

configure :production do
  set :static_cache_control, [:public, max_age: 86_400]
end

Stripe.api_key = settings.stripe_secret

get "/" do
  erb :index
end

post "/charge" do
  charge = Stripe::Charge.create({
    amount: params[:amount],
    description: "OwS Coffee!",
    currency: "usd",
    card: params[:token]
  })

  200
end
