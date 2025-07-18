
using VRMS.Domain.Entities;

using Microsoft.EntityFrameworkCore;
using System.Diagnostics;
using VRMS.Domain.Entities;

namespace VRMS.Infrastructure.Data
{
    public class VRMSDbContext : DbContext
    {
        public VRMSDbContext(DbContextOptions<VRMSDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<Customer> Customers { get; set; }
        public DbSet<Agent> Agents { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<UserRole> UserRoles { get; set; }
        public DbSet<InsurancePolicy> InsurancePolicy { get; set; }
        public DbSet<Vehicle> Vehicles { get; set; }
        public DbSet<Car> Cars { get; set; } // ✅ Added Cars Table
        public DbSet<Bus> Buses { get; set; } // ✅ Added Buses Table
        public DbSet<Motorcycle> Motorcycles { get; set; } // ✅ Added Motorcycles Table
        public DbSet<Reservation> Reservations { get; set; }
        public DbSet<Payment> Payments { get; set; }
        public DbSet<Receipt> Receipts { get; set; }
        public DbSet<Truck> Trucks { get; set; } // ✅ Added Trucks Table
        public DbSet<VerificationCode> VerificationCodes { get; set; }
        public DbSet<Photo> Photos { get; set; }

        public DbSet<VehicleGpsHistory> VehicleGpsHistories { get; set; }

        public DbSet<TripDetails> TripDetails { get; set; } // ✅ Added TripDetails Table
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // ✅ Table-per-Type (TPT) Inheritance for Users
            modelBuilder.Entity<User>().ToTable("Users");
            modelBuilder.Entity<Customer>().ToTable("Customers");
            modelBuilder.Entity<Agent>().ToTable("Agents");

            // ✅ Table-per-Type (TPT) Inheritance for Vehicles
            modelBuilder.Entity<Vehicle>().ToTable("Vehicles");
            modelBuilder.Entity<Car>().ToTable("Cars");
            modelBuilder.Entity<Bus>().ToTable("Buses");
            modelBuilder.Entity<Motorcycle>().ToTable("Motorcycles");
            modelBuilder.Entity<Truck>().ToTable("Trucks"); // ✅ Table-Per-Type (TPT)


            // ✅ Many-to-Many Relationship between User and Role
            modelBuilder.Entity<UserRole>()
                .HasKey(ur => new { ur.UserId, ur.RoleId });

            modelBuilder.Entity<UserRole>()
                .HasOne(ur => ur.User)
                .WithMany(u => u.UserRoles)
                .HasForeignKey(ur => ur.UserId);

            modelBuilder.Entity<UserRole>()
                .HasOne(ur => ur.Role)
                .WithMany(r => r.UserRoles)
                .HasForeignKey(ur => ur.RoleId);

            // ✅ 1:1 Relationship - Customer and Agent inherit from User
            modelBuilder.Entity<Customer>()
                .HasOne<User>()
                .WithOne()
                .HasForeignKey<Customer>(c => c.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Agent>()
                .HasOne<User>()
                .WithOne()
                .HasForeignKey<Agent>(a => a.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // ✅ 1:1 Relationship - Customer has only ONE InsurancePolicy
            modelBuilder.Entity<InsurancePolicy>()
                .HasOne(ip => ip.Customer)
                .WithOne(c => c.InsurancePolicy)
                .HasForeignKey<InsurancePolicy>(ip => ip.CustomerId)
                .OnDelete(DeleteBehavior.Cascade);

            // ✅ 🚗 One-to-Many: Customer to Reservations
            modelBuilder.Entity<Customer>()
                .HasMany(c => c.Reservations)
                .WithOne(r => r.Customer)
                .HasForeignKey(r => r.CustomerId)
                .OnDelete(DeleteBehavior.Cascade);


            // ✅ 🚗 One-to-One Relationship: Reservation to Vehicle
            modelBuilder.Entity<Reservation>()
                .HasOne(r => r.Vehicle)
                .WithMany(v => v.Reservations)
                .HasForeignKey(r => r.VehicleId)
                .OnDelete(DeleteBehavior.Cascade);

            // ✅ 🚫 Ensure a vehicle cannot be booked at the same time
            modelBuilder.Entity<Reservation>()
                .HasIndex(r => new { r.VehicleId, r.StartDate, r.EndDate })
                .IsUnique();

            // ✅ 💳 One-to-One Relationship: Reservation to Payment
            modelBuilder.Entity<Payment>()
                .HasOne(p => p.Reservation)
                .WithMany(r => r.Payments)
                .HasForeignKey(p => p.ReservationId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Receipt>()
               .HasOne(r => r.Payment)
               .WithOne(p => p.Receipt)
               .HasForeignKey<Receipt>(r => r.PaymentId)
               .OnDelete(DeleteBehavior.Cascade);


            // ✅ Ensure decimal precision for monetary values
            modelBuilder.Entity<Receipt>()
                .Property(r => r.Amount)
                .HasColumnType("decimal(18,2)"); // ✅ Fixes truncation warning

            modelBuilder.Entity<Vehicle>()
                .Property(v => v.PrepayFee)
                .HasColumnType("decimal(18,2)"); // ✅ Fixes truncation warning


            // ✅ 🔢 Fix Decimal Precision for Payment Table
            modelBuilder.Entity<Payment>()
                .Property(p => p.PrepaymentAmount)
                .HasColumnType("decimal(18,2)");

            modelBuilder.Entity<Payment>()
                .Property(p => p.TotalPrice)
                .HasColumnType("decimal(18,2)");

            // ✅ Stripe-Related Decimal Precision
            modelBuilder.Entity<Payment>()
                .Property(p => p.StripePaymentIntentId)
                .HasColumnType("varchar(255)");

            modelBuilder.Entity<Payment>()
                .Property(p => p.StripeClientSecret)
                .HasColumnType("varchar(255)");


            modelBuilder.Entity<TripDetails>()
            .HasOne(td => td.Vehicle)
            .WithMany(v => v.TripDetails)
            .HasForeignKey(td => td.VehicleId)
            .OnDelete(DeleteBehavior.Cascade); // Or Restrict if you want to keep TripDetails when deleting Vehicles

            modelBuilder.Entity<TripDetails>()
                .Property(p => p.DistanceTraveled)
                .HasColumnType("decimal(18,2)");

            modelBuilder.Entity<TripDetails>()
                .Property(p => p.TotalCost)
                .HasColumnType("decimal(18,2)");
            // ✅ Seeding Roles
            modelBuilder.Entity<Role>().HasData(
                new Role(1, "Customer"),
                new Role(2, "Agent"),
                new Role(3, "Admin")
            );
            modelBuilder.Entity<Photo>()
            .HasOne(p => p.Vehicle)
            .WithMany(v => v.Photos)
            .HasForeignKey(p => p.VehicleId)
            .OnDelete(DeleteBehavior.Cascade);
            modelBuilder.Entity<VerificationCode>()
                .HasOne(vc => vc.User)
                .WithMany(u => u.VerificationCodes) // User has many VerificationCodes
                .HasForeignKey(vc => vc.UserId)
                .OnDelete(DeleteBehavior.Cascade);


            base.OnModelCreating(modelBuilder); // Ensure EF Core processes configurations correctly
        }
    }
}
