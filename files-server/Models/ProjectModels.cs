namespace FilesServer.Models;

using System.Text.Json.Serialization;
public class Project
{
  [JsonPropertyName("project")]
  public string ProjectName { get; set; } = string.Empty;

  [JsonPropertyName("description")]
  public string? Description { get; set; } = string.Empty;

  [JsonPropertyName("scenarios")]
  public Scenario[] Scenarios { get; set; } = Array.Empty<Scenario>();
}


public class Scenario
{

  [JsonPropertyName("id")]
  public string? Id { get; set; }

  [JsonPropertyName("name")]
  public string Name { get; set; } = string.Empty;

  [JsonPropertyName("steps")]
  public Steps[] Steps { get; set; } = Array.Empty<Steps>();
}

public class Steps
{
  [JsonPropertyName("order")]
  public int Order { get; set; }

  [JsonPropertyName("context")]
  public string? Context { get; set; } = string.Empty;

  [JsonPropertyName("image")]
  public string Image { get; set; } = string.Empty;

}
