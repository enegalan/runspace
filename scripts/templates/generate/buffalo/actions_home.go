package actions

import "github.com/gobuffalo/buffalo"

func HomeHandler(c buffalo.Context) error {
    _, err := c.Response().Write([]byte("Hello from Runspace Buffalo sandbox!\n"))
    return err
}
