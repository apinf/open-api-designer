# Open API designer project charter

## Objective
The goal is to have an OpenAPI design tool and a storage backend that can be integrated with APInf platform.

## Risks
* Duplication of effort
* Misalignment with business or community goals
* Failure to execute or prioritize properly
* Miscommunication of project intent or scope
* Going into competition with other companies and solutions

## Value proposition
User can create an OpenAPI document without knowing the specification or being familiar with JSON or YAML. User is guided by user interface elements such as hints in form fields and mandatory fields.

## Scope
* User can create a valid OpenAPI document according to OpenAPI specification version 2.0, maybe 3.0.
* Input validation for the form fields
* User can download the created document.
* User can import an existing document to be edited.
* The user can upload the document to backend service.
* Communication to storage backend with REST API(s)

## Out of scope
* Integrations to 3rd party systems beyond iframes or custom elements
* Dynamic validation of the output with 3rd party solutions

## Stakeholders
* APInf API management platform and company
* Open source community, particularly people who are focused with API development and design.
