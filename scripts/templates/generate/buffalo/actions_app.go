package actions

import "github.com/gobuffalo/buffalo"

var app *buffalo.App

func App() *buffalo.App {
    if app == nil {
        app = buffalo.New(buffalo.Options{})
        app.GET("/", HomeHandler)
    }
    return app
}
