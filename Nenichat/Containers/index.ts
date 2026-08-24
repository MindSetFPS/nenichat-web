import { DokployContainerService } from "./Infrastructure/Dokploy/DokployContainerService";
import { SupabaseContainerRepository } from "./Infrastructure/Supabase/SupabaseContainerRepository";

// Registry/Factories for ease of use
export const containerService = new DokployContainerService();

export * from "./Domain/IContainerService";
export * from "./Domain/IContainerRepository";
export * from "./Infrastructure/Dokploy/DokployContainerService";
export * from "./Infrastructure/Supabase/SupabaseContainerRepository";
export * from "./Infrastructure/Dokploy/templates";
export * from "./app/fetch-and-store-qr-code";
