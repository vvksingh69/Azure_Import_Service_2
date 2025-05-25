resource "azurerm_windows_function_app" "import_service_function" {
  name                        = "fa-import-service-sand-ne-001"
  location                    = azurerm_resource_group.import_service_rg.location
  resource_group_name         = azurerm_resource_group.import_service_rg.name
  service_plan_id             = azurerm_service_plan.import_service_plan.id
  storage_account_name        = azurerm_storage_account.import_service_sa.name
  storage_account_access_key  = azurerm_storage_account.import_service_sa.primary_access_key
  functions_extension_version = "~4"
  builtin_logging_enabled     = true

  site_config {
    always_on = false

    application_insights_key               = azurerm_application_insights.import_service_ai.instrumentation_key
    application_insights_connection_string = azurerm_application_insights.import_service_ai.connection_string

    use_32_bit_worker = true

    cors {
      allowed_origins = ["https://portal.azure.com"]
    }

    application_stack {
      node_version = "~18"
    }
  }

  app_settings = {
    FUNCTIONS_WORKER_RUNTIME                 = "node"
    WEBSITE_CONTENTAZUREFILECONNECTIONSTRING = azurerm_storage_account.import_service_sa.primary_connection_string
    WEBSITE_CONTENTSHARE                     = azurerm_storage_share.import_service_fa_share.name
    AzureWebJobsStorage                      = azurerm_storage_account.import_service_sa.primary_connection_string
  }

  lifecycle {
    ignore_changes = [
      app_settings,
      site_config["application_stack"],
      tags["hidden-link: /app-insights-instrumentation-key"],
      tags["hidden-link: /app-insights-resource-id"],
      tags["hidden-link: /app-insights-conn-string"]
    ]
  }
}
