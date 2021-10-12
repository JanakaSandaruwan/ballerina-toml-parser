# Choreo Ballerina Toml Parser

Support to handle read and edit operations in Ballerina.toml file

## Inputs

### `type`

File operation type.

### `name`

Project Name

### `org`

Organization Name


## Example

```
  build:
    steps:
    - name: Ballerina Toml Parser
      uses: choreo-templates/ballerina-toml-parser@1.0
      with:
       type: ${{secrets.DOMAIN}}
       org: ${{secrets.ORG_ID}}
       name: ${{secrets.PROJECT_ID}}
```