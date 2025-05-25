resource "azurerm_service_plan" "import_service_plan" {
  name                = "asp-import-service-sand-ne-001"
  location            = azurerm_resource_group.import_service_rg.location
  resource_group_name = azurerm_resource_group.import_service_rg.name
  os_type             = "Windows"
  sku_name            = "Y1" # Consumption plan
}