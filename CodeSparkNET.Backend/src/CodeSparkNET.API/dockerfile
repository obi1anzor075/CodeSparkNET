# build stage
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY ["CodeSparkNET.csproj", "./"]
RUN dotnet restore "CodeSparkNET.csproj"
COPY . .
RUN dotnet publish "CodeSparkNET.csproj" -c Release -o /app/publish

# runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 80
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "CodeSparkNET.dll"]
