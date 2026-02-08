import { DokployContainerService } from "./Infrastructure/Dokploy/DokployContainerService";
import { SupabaseContainerRepository } from "./Infrastructure/Supabase/SupabaseContainerRepository";

// Registry/Factories for ease of use
export const containerService = new DokployContainerService();
export const containerRepository = new SupabaseContainerRepository();

export * from "./Domain/IContainerService";
export * from "./Domain/IContainerRepository";
export * from "./Infrastructure/Dokploy/DokployContainerService";
export * from "./Infrastructure/Supabase/SupabaseContainerRepository";
export * from "./Infrastructure/Dokploy/templates";
